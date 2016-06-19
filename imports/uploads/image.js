import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';
import uuid from 'node-uuid';

const { S3Bucket: bucket, S3Region: region } = Meteor.settings.public;

Slingshot.fileRestrictions("imageUploads", {
  allowedFileTypes: ["image/jpeg", "image/png"],
  maxSize: 10 * 1024 * 1024
});

if (Meteor.isServer) {
  Slingshot.createDirective("imageUploads", Slingshot.S3Storage, {
    bucket,
    region,
    acl: "public-read",
    authorize() {
      return true;
    },
    key(file) {
      const extension = path.extname(file.name);
      const filename  = uuid.v4().replace(/\-/g, "").replace(/0/g, "1");

      return `images/${filename}${extension}`;
    }
  });
}

export function imageURL(filename) {
  return `https://${bucket}.s3-${region}.amazonaws.com/images/${filename}`;
}
