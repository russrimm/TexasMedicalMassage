"use client";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitReviewAction } from "@/server/actions/reviews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewForm({
  subjectType,
  subjectId,
}: {
  subjectType: "therapist" | "business";
  subjectId: string;
}) {
  const [rating, setRating] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("rating", String(rating));
    formData.set("subjectType", subjectType);
    formData.set("subjectId", subjectId);
    startTransition(async () => {
      try {
        await submitReviewAction(formData);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit");
      }
    });
  }

  if (done) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Thanks — your review has been posted.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a review</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i} stars`}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition",
                      i <= rating
                        ? "fill-yellow-500 stroke-yellow-500"
                        : "stroke-muted-foreground",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" maxLength={120} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Your review</Label>
            <Textarea id="body" name="body" rows={4} required minLength={10} maxLength={2000} />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Posting..." : "Post review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
