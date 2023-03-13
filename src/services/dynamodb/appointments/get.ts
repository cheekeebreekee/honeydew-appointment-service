import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Appointment, config, logError, logInfo } from "honeydew-shared";

const dynamoDb = new DynamoDB({});

export const get = async (appointmentId: string): Promise<Appointment> => {
  logInfo("Getting appointment from DB", { appointmentId });

  const query = {
    TableName: config.getSharedValue("appointmentsTableName"),
    Key: marshall({
      appointmentId,
    }),
  };

  logInfo("Getting appointment from DB query", query);

  const { Item } = await dynamoDb.getItem(query);

  if (!Item) {
    const message = `Appointment with ID ${appointmentId} is not found`;
    logError(message);
    throw new Error(message);
  }

  logInfo("Appointment found", Item);

  return unmarshall(Item) as Appointment;
};
