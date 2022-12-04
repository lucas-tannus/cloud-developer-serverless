import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')
const cert = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJWe5wFIbK4SdMMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1rZ2p2ZXJxenltdzBoY2pwLnVzLmF1dGgwLmNvbTAeFw0yMjExMjIw
MjQ4MzBaFw0zNjA3MzEwMjQ4MzBaMCwxKjAoBgNVBAMTIWRldi1rZ2p2ZXJxenlt
dzBoY2pwLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAJj6pd/JPLojcMD19wU4LBEKZ9c7Q0pvCI9WO5Eoj2W/Gu0eax1ie3/Jm6qt
kl9aAKmQ0hxoD/GDBxu3d+EjhJylM+qOiTTgSJgbJv0BYzBMHRzepXeof0JrF4+M
1ObkjnLiwDaJ9A0vSVS3syTQ6K8urEx69RLDLu7HA+KHkKlqXg4ecrIvTRVSM9pp
4eITqqOQxAjRSOIuTh+XPamOfrECwdkpkjfVTeb5eL2NBYtydxsn0VE4zY+Uor9d
/ec1yDxCNvoCA+cyPH059ykMHloTzXjLEEk2+vs0zri7JvRemZcghockXY4C91yu
kyCpv+jRISabq/kaqxBHCiIUUqUCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUQPGI9Md+rq1ycaAdqf2l+2UPFq4wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQAcW4fO9ZmN3wKhWxIOh1wxnzEeEOK0tRscOaQI5Hqc
ox5y+tICxFYMbZh35xmyzYTT1mD6kgIpXl3OVBQLScUpzO81H0D+tZzmzdb664lo
ljhrYXdMiIZaBYrgAZeCKtplRCu0cZr9+aHq9ymA5OeF5LT96rY3i2m766ng5D1W
mHn/E1zDVpbigib9rQNX7JPxP8inlf7+95i8rGo+s/UnCYIAvoLeYhvzRRO4lYTw
UjEIBboQ0sabO/akFLyvqDnE2mvDrOWeSbuvt8bYqf5t+g+qfW8/EwhMYay7M0an
+J/RKPEbyQHR8RbHJJ1LZWq38TVnc5av1fPElTx/QgxV
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
