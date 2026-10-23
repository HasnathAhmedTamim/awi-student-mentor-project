export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Submission = {
  id: string;
  projectName: string;
  repositoryUrl: string;
  liveUrl: string;
  description: string;
  status: SubmissionStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubmissionDetail = Submission & {
  student: { id: string; name: string; email: string };
  reviewedBy: { id: string; name: string } | null;
};
