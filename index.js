"use strict";

const aws = require("aws-sdk");
const s3 = new aws.S3();

exports.handler = async function (event, context) {
  const record = event["Records"][0];
  const bucketName = record["s3"]["bucket"]["name"];
  const newImageKey = record["s3"]["object"]["key"];
  const imageType = newImageKey.split(".").pop();
  const imageSizeInBytes = record["s3"]["object"]["size"];
  const imageSizeInMB = `${imageSizeInBytes / 1024 / 1024} MB`;

  let imageData = [];

  try {
    const data = await s3
      .getObject({ Bucket: bucketName, Key: "images.json" })
      .promise();
    imageData = JSON.parse(data.Body.toString("utf-8"));
  } catch (err) {}

  const newImageObject = {
    name: newImageKey,
    type: imageType,
    size: imageSizeInMB,
  };

  const existingIndex = imageData.findIndex(
    (element) => element.name === newImageKey
  );
  if (existingIndex > -1) {
    imageData[existingIndex] = newImageObject;
  } else {
    imageData.push(newImageObject);
  }

  await s3
    .putObject({
      Bucket: bucketName,
      Key: "images.json",
      Body: JSON.stringify(imageData),
      ContentType: "application/json",
    })
    .promise();

  return "images.json has been updated successfully";
};
