from enum import StrEnum

class SummaryStatus(StrEnum):
  SUBMITTED = "SUBMITTED"
  IN_PROGRESS = "IN_PROGRESS"
  RESOLVED = "RESOLVED"

class ProcessStatus(StrEnum):
  CLUSTERED = "CLUSTERED"
  NEW_TOPIC = "NEW_TOPIC"
  DISCARDED = "DISCARDED"
  FLAGGED = "FLAGGED"
  