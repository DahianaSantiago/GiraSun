import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "./index";

/**
 * Server component that renders the MDX body of a post inside .prose.
 *
 * Replaces the Phase 2 src/lib/post-bodies.tsx switch — pages call
 * `<PostBody source={post.body} />` and MDXRemote does the compile.
 */
export function PostBody({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
        },
      }}
    />
  );
}
