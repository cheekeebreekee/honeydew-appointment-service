import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { Appointment, config, logError, logInfo } from "honeydew-shared";

const dynamoDb = new DynamoDB({});

export const getByPatientId = async (
  patientId: string
): Promise<Appointment[]> => {
  logInfo("Getting appointments from DB by patient ID", { patientId });

  const query = {
    TableName: config.getSharedValue("appointmentsTableName"),
    KeyConditionExpression: "#patientId = :ID",
    ExpressionAttributeNames: {
      "#patientId": "patientId",
    },
    ExpressionAttributeValues: {
      ":ID": {
        S: patientId,
      },
    },
    IndexName: "patientIdIndex",
    ReturnValues: "ALL_NEW",
  };

  logInfo("Getting appointments from DB query", query);

  const { Items } = await dynamoDb.query(query);

  if (!Items?.length) {
    const message = `Appointments with patient ID ${patientId} was not found`;
    logError(message);
    throw new Error(message);
  }

  logInfo("Appointment found", Items);

  return Items.map((item) => unmarshall(item)) as Appointment[];
};
