import fetch from 'cross-fetch'
import { decode as decodeJwt } from 'jsonwebtoken'

import { db } from 'src/lib/db'
import { logger } from 'src/lib/logger'
import { encodeBody, getExpiration } from 'src/lib/oAuth/helpers'

export const KEYP = 'KEYP'

let KEYP_OAUTH_DOMAIN = 'https://app.usekeyp.com/oauth'

if (process.env.LOCAL_KEYP_SERVER) KEYP_OAUTH_DOMAIN = 'http://localhost/oauth' // Don't worry about this, its only needed by the Keyp team

export const KEYP_OAUTH_URL_AUTHORIZE = `${KEYP_OAUTH_DOMAIN}/auth`

const KEYP_OAUTH_URL_TOKEN = `${KEYP_OAUTH_DOMAIN}/token`

const KEYP_REDIRECT_URI = process.env.APP_DOMAIN + '/redirect/keyp'

const responseType = 'code'
const params = {
  client_id: process.env.KEYP_CLIENT_ID,
  scope: 'openid email',
  redirect_uri: KEYP_REDIRECT_URI,
}

export const onSubmitCode = async (code, { codeVerifier }) => {
  try {
    const body = {
      grant_type: 'authorization_code',
      client_id: process.env.KEYP_CLIENT_ID,
      redirect_uri: KEYP_REDIRECT_URI,
      code_verifier: codeVerifier,
      code,
    }
    const encodedBody = encodeBody(body)
    logger.debug({ custom: body }, '/token request body')
    const response = await fetch(KEYP_OAUTH_URL_TOKEN, {
      method: 'post',
      body: encodedBody,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(async (res) => {
      const status = res.status
      if (status !== 200) {
        const text = await res.json()
        throw `KEYP API failed for /token. Returned ${status} - ${text.error} ${text.error_description}`
      }
      return res.json()
    })
    if (response.error)
      throw `${response.error} - ${response.hint}. ${response.message}`

    const {
      access_token: accessToken,
      expires_in: expiration,
      id_token: idToken,
    } = response

    if (!response.id_token) throw 'Failed to get id_token'
    const decoded = await decodeJwt(idToken)

    logger.debug({ custom: response }, '/token response')
    logger.debug({ custom: decoded }, 'decoded id_token')

    if (new Date() - new Date(decoded.iat * 1000) > 60 * 1000)
      throw 'id_token was not issued recently. It must be <1 minute old.'

    return {
      accessToken,
      accessTokenExpiration: getExpiration(expiration),
      idToken,
      decoded,
      idTokenExpiration: new Date(decoded.exp * 1000),
    }
  } catch (e) {
    throw `onSubmitCode() ${e}`
  }
}

export const onConnected = async ({ accessToken, decoded }) => {
  try {
    const userDetails = await fetch(`${KEYP_OAUTH_DOMAIN}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      if (res.status != 200)
        throw 'KEYP authorization failed, or secret invalid'
      return res.json()
    })

    // Prevent token substitution attacks. See https://openid.net/specs/openid-connect-core-1_0.html#TokenSubstitution
    if (decoded.sub != userDetails.sub)
      throw "id_token's sub does not match userInfo"

    logger.debug({ custom: userDetails }, 'User info')

    const user = await db.user.upsert({
      update: { email: userDetails.email, accessToken },
      create: {
        id: userDetails.sub,
        email: userDetails.email,
        username: userDetails.username,
        address: userDetails.address,
        accessToken,
      },
      where: { id: userDetails.sub },
    })
    return user
  } catch (e) {
    logger.error(e)
    throw `onConnected() ${e}`
  }
}

export const provider = {
  urlAuthorize: KEYP_OAUTH_URL_AUTHORIZE,
  params,
  onSubmitCode,
  onConnected,
  responseType,
}
