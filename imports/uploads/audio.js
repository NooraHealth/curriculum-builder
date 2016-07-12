import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';
import uuid from 'node-uuid';

const { S3Bucket: bucket, S3Region: region } = Meteor.settings.public;

const supportedMIMEs = ["audio/m4a", "audio/x-m4a", "audio/mp3", "audio/wav", "audio/x-wav", "audio/ogg", "audio/aac"];

Slingshot.fileRestrictions("audioUploads", {
  allowedFileTypes: supportedMIMEs,
  maxSize: 10 * 1024 * 1024
});

if (Meteor.isServer) {
  Slingshot.createDirective("audioUploads", Slingshot.S3Storage, {
    bucket,
    region,
    acl: "public-read",
    authorize() {
      return true;
    },
    key(file) {
      const extension = path.extname(file.name);
      const filename  = uuid.v4().replace(/\-/g, "");

      return `NooraHealthContent/Audio/${filename}${extension}`;
    }
  });
}

export function audioURL(filename) {
  return `https://${bucket}.s3-${region}.amazonaws.com/NooraHealthContent/Audio/${filename}`;
}

export { supportedMIMEs };
