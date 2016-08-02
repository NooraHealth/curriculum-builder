import { Meteor } from 'meteor/meteor';
import knox from 'knox';

const {
  AWSAccessKeyId: key,
  AWSSecretAccessKey: secret,
  public: {
    S3Bucket: bucket,
    S3Region: region
  }
} = Meteor.settings;

let client;

if (Meteor.isServer) {
  client = knox.createClient({
    key,
    secret,
    bucket,
    region
  });
} else {
  client = {
    deleteFile: function() {
      throw new Error('Not supported');
    }
  };
}


export default client;
