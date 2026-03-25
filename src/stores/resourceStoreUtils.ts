type EntityWithId = {
  id: string
}

type EntityWithIdAndCreatedAt = EntityWithId & {
  createdAt: string
}

export function prependRecord<T>(records: T[], nextRecord: T) {
  return [nextRecord, ...records]
}

export function findRecordById<T extends EntityWithId>(
  records: T[],
  id: string,
) {
  return records.find((record) => record.id === id) ?? null
}

export function replaceRecordById<T extends EntityWithId>(
  records: T[],
  nextRecord: T,
) {
  return records.map((record) =>
    record.id === nextRecord.id ? nextRecord : record,
  )
}

export function removeRecordById<T extends EntityWithId>(
  records: T[],
  id: string,
) {
  return records.filter((record) => record.id !== id)
}

export function upsertRecordById<T extends EntityWithId>(
  records: T[],
  nextRecord: T,
) {
  return findRecordById(records, nextRecord.id)
    ? replaceRecordById(records, nextRecord)
    : prependRecord(records, nextRecord)
}

export function sortRecordsByCreatedAtDesc<T extends { createdAt: string }>(
  records: T[],
) {
  return records
    .slice()
    .sort(
      (firstRecord, secondRecord) =>
        new Date(secondRecord.createdAt).getTime() -
        new Date(firstRecord.createdAt).getTime(),
    )
}

export function upsertRecordByCreatedAtDesc<T extends EntityWithIdAndCreatedAt>(
  records: T[],
  nextRecord: T,
) {
  return sortRecordsByCreatedAtDesc(upsertRecordById(records, nextRecord))
}

export function syncSelectedRecord<T extends EntityWithId>(
  selectedRecord: T | null,
  nextRecord: T,
) {
  return selectedRecord?.id === nextRecord.id ? nextRecord : selectedRecord
}

export function clearSelectedRecord<T extends EntityWithId>(
  selectedRecord: T | null,
  id: string,
) {
  return selectedRecord?.id === id ? null : selectedRecord
}
