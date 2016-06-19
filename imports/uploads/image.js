import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import path from 'path';
import uuid from 'node-uuid';

Slingshot.fileRestrictions("imageUploads", {
  allowedFileTypes: ["image/jpeg", "image/png"],
  maxSize: 10 * 1024 * 1024
});

if (Meteor.isServer) {
  Slingshot.createDirective("imageUploads", Slingshot.S3Storage, {
    bucket: Meteor.settings.S3Bucket,
    region: Meteor.settings.S3Region,
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
