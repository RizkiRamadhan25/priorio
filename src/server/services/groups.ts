import "server-only";
import type { GroupKind } from "@/domain/types";
import { categoryInput, courseInput, entityId } from "@/domain/validation";
import { normalize } from "@/lib/validation/normalization";
import { transaction } from "@/server/repositories/mutations";
import { DomainIssue, parse } from "./results";

export function saveGroup(kind: GroupKind, id: unknown, input: unknown) {
  const key = id === null ? null : parse(entityId, id);
  return transaction(async (tx) => {
    if (kind === "course") {
      const course = parse(courseInput, input);
      const data = { ...course, nameKey: normalize(course.name) };
      return key ? tx.course.update({ where: { id: key }, data }) : tx.course.create({ data });
    }
    const category = parse(categoryInput, input);
    const data = { ...category, nameKey: normalize(category.name) };
    return key ? tx.category.update({ where: { id: key }, data }) : tx.category.create({ data });
  }).then(({ id: savedId }) => savedId);
}

export function archiveGroup(kind: GroupKind, rawId: unknown, isArchived: unknown) {
  const id = parse(entityId, rawId);
  if (typeof isArchived !== "boolean") throw new DomainIssue("validation");
  return transaction(async (tx) => {
    const data = { isArchived };
    if (kind === "course") await tx.course.update({ where: { id }, data });
    else await tx.category.update({ where: { id }, data });
    return id;
  });
}

export function removeGroup(kind: GroupKind, rawId: unknown) {
  const id = parse(entityId, rawId);
  return transaction(async (tx) => {
    const where = kind === "course" ? { courseId: id } : { categoryId: id };
    if (await tx.task.count({ where })) throw new DomainIssue("referenced");
    if (kind === "course") await tx.course.delete({ where: { id } });
    else await tx.category.delete({ where: { id } });
    return id;
  });
}
