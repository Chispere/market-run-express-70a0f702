
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_profile: {
    full_name: string;
  };
}

interface ReviewsListProps {
  userId: string;
  limit?: number;
}

const ReviewsList = ({ userId, limit = 10 }: ReviewsListProps) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', userId, limit],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          reviewer_profile:profiles!reviews_reviewer_id_fkey(full_name)
        `)
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });

  const { data: averageRating } = useQuery({
    queryKey: ['average-rating', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewed_id', userId);

      if (error) throw error;
      
      if (!data.length) return { average: 0, count: 0 };
      
      const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
      return { average: Math.round(average * 10) / 10, count: data.length };
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {averageRating && averageRating.count > 0 && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-medium">{averageRating.average}</span>
          <span className="text-sm text-gray-600">
            ({averageRating.count} review{averageRating.count !== 1 ? 's' : ''})
          </span>
        </div>
      )}

      {!reviews?.length ? (
        <Card>
          <CardContent className="text-center py-8">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-gray-500">No reviews yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.reviewer_profile.full_name}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
