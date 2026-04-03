import { formatDistanceToNow } from "date-fns";

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function reactionCounts(reactions: Array<{ value: "LIKE" | "DISLIKE" }>) {
  return reactions.reduce(
    (acc, current) => {
      if (current.value === "LIKE") acc.likes += 1;
      if (current.value === "DISLIKE") acc.dislikes += 1;
      return acc;
    },
    { likes: 0, dislikes: 0 }
  );
}
