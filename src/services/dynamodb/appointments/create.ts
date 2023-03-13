import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Appointment, config, logInfo } from "honeydew-shared";

const dynamoDb = new DynamoDB({});

export const create = async (appointment: Appointment) => {
  logInfo(`Create appointment in DB`, appointment);

  const query = {
    TableName: config.getSharedValue("appointmentsTableName"),
    Item: marshall(appointment),
  };

  logInfo("Create appointment query", query);

  await dynamoDb.putItem(query);

  logInfo("Appointment has been created successfully");
};
