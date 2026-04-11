import { formatDistanceToNow } from "date-fns";

export function timeAgo(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function reactionCounts(reactions: Array<{ value: string }>) {
  return reactions.reduce(
    (acc, current) => {
      if (current.value === "UPVOTE" || current.value === "LIKE") acc.likes += 1;
      if (current.value === "DOWNVOTE" || current.value === "DISLIKE") acc.dislikes += 1;
      return acc;
    },
    { likes: 0, dislikes: 0 }
  );
}
