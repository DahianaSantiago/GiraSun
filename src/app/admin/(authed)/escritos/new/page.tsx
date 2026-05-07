import { PostEditor } from "@/components/admin/PostEditor";

export const metadata = { title: "Nuevo escrito" };

export default function NewEscritoPage() {
  return <PostEditor type="escrito" />;
}
