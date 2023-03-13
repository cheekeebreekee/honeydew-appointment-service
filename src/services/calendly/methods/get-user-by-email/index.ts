import axios from "axios";
import {
  AppointmentServiceConfig,
  CalendlyCollection,
  CalendlyMembership,
  CalendlyUser,
  logInfo,
  logError,
} from "honeydew-shared";

async function nextPage(
  config: AppointmentServiceConfig,
  nextPageUrl?: string
): Promise<CalendlyUser[]> {
  const { data } = await axios.get<
    CalendlyCollection<CalendlyMembership<CalendlyUser>>
  >(nextPageUrl || `${config.calendly.baseUrl}/organization_memberships`, {
    params: {
      organization: config.calendly.organization,
    },
    headers: {
      Authorization: `Bearer ${config.calendly.apiToken}`,
    },
  });

  return [
    ...data.collection.map(({ user }) => user),
    ...(data.pagination.next_page
      ? await nextPage(config, data.pagination.next_page)
      : []),
  ];
}

export async function getUserByEmail(
  email: string,
  config: AppointmentServiceConfig
) {
  logInfo("Getting Calendly users by email", {
    email,
  });
  const calendlyUsers = await nextPage(config);
  logInfo("All users found", calendlyUsers);
  const foundUser = calendlyUsers.find((user) => user.email === email);
  if (!foundUser) {
    const message = `Cannot find Calendly user with email "${email}"`;
    logError(message);
    throw new Error(message);
  }

  logInfo("Found user", foundUser);

  return foundUser;
}
