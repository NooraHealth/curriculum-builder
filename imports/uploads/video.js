import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';
import uuid from 'node-uuid';

const { S3Bucket: bucket, S3Region: region } = Meteor.settings.public;

Slingshot.fileRestrictions("videoUploads", {
  allowedFileTypes: ["video/mp4", "video/quicktime"],
  maxSize: 10 * 1024 * 1024
});

if (Meteor.isServer) {
  Slingshot.createDirective("videoUploads", Slingshot.S3Storage, {
    bucket,
    region,
    acl: "public-read",
    authorize() {
      return true;
    },
    key(file) {
      const extension = path.extname(file.name);
      const filename  = uuid.v4().replace(/\-/g, "");

      return `NooraHealthContent/Video/${filename}${extension}`;
    }
  });
}

export function videoURL(filename) {
  return `https://${bucket}.s3-${region}.amazonaws.com/NooraHealthContent/Video/${filename}`;
}
