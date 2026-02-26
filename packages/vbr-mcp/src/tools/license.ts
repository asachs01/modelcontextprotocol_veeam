import { vbrFetch } from "../lib/vbr-client.js";
import { withAuth, toolSuccess } from "../lib/tool-helpers.js";

interface LicenseData {
  status: string;
  edition: string;
  expirationDate: string;
  licensedTo: string;
  supportExpirationDate: string;
  instanceLicenseSummary?: {
    package: string;
    licensedInstancesNumber: number;
    usedInstancesNumber: number;
    workload?: Array<{ type: string; [key: string]: unknown }>;
  };
}

export const getLicenseInfoSchema = {};

export const getLicenseInfoHandler = withAuth(async (_params, auth) => {
  const response = await vbrFetch(auth, "/api/v1/license");
  const data = (await response.json()) as LicenseData;

  return toolSuccess({
    status: data.status,
    edition: data.edition,
    expirationDate: data.expirationDate,
    licensedTo: data.licensedTo,
    instanceLicenseSummary: {
      package: data.instanceLicenseSummary?.package,
      licensedInstancesNumber: data.instanceLicenseSummary?.licensedInstancesNumber,
      usedInstancesNumber: data.instanceLicenseSummary?.usedInstancesNumber,
      workloadCount: data.instanceLicenseSummary?.workload?.length || 0,
    },
    supportExpirationDate: data.supportExpirationDate,
  });
});

export const getLicenseWorkloadsSchema = {};

export const getLicenseWorkloadsHandler = withAuth(async (_params, auth) => {
  const response = await vbrFetch(auth, "/api/v1/license");
  const data = (await response.json()) as LicenseData;

  const workloads = data.instanceLicenseSummary?.workload || [];
  const workloadsByType: Record<string, unknown[]> = {};
  for (const workload of workloads) {
    const type = workload.type;
    if (!workloadsByType[type]) workloadsByType[type] = [];
    workloadsByType[type].push(workload);
  }

  return toolSuccess(workloadsByType);
});
