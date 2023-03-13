import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { config, logInfo } from "honeydew-shared";

const dynamoDb = new DynamoDB({});

export const remove = async (appointmentId: string) => {
  logInfo("Delete appointment from DB", { appointmentId });

  const query = {
    TableName: config.getSharedValue("appointmentsTableName"),
    Key: marshall({
      appointmentId,
    }),
  };

  logInfo("Delete appointment from DB query", query);

  await dynamoDb.deleteItem(query);

  logInfo("Appointment has been deleted successfully");
};
