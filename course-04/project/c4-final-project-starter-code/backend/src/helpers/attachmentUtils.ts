import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export async function createAttachmentPresignedUrl(todoId: string) {
    return s3.getSignedUrl('PutObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: urlExpiration
    })
}
