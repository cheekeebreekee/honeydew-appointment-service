import { DynamoDB, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { Appointment, config, logError, logInfo } from "honeydew-shared";
import { DynamoDBService } from "..";

const dynamoDb = new DynamoDB({});

export const setAppointmentStatus = async (
  appointmentId: string,
  status: string
) => {
  logInfo("Updating appointment status in DB", { appointmentId, status });

  const query: UpdateItemCommandInput = {
    TableName: config.getSharedValue("appointmentsTableName"),
    Key: marshall({
      appointmentId,
    }),
    UpdateExpression: "set #status=:STATUS",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: marshall({
      ":STATUS": status,
    }),
    ReturnValues: "ALL_NEW",
  };

  logInfo("Update appointment status query", query);

  const { Attributes } = await dynamoDb.updateItem(query);

  return unmarshall(Attributes as any) as Appointment;
};
