import PostsView from "@/components/PostsView";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Flagged Posts Review Tool</h1>
      <p className="mt-2 text-sm text-gray-600">
        View, filter, and update flagged posts.
      </p>
      <PostsView />
    </main>
  );
}
