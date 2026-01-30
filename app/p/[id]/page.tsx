import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getData(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/pastes/${id}`,
  );

  return res.json();
}

const Page = async ({ params }: { params: { id: string } }) => {
  const param = await params;

  const data = await getData(param.id);

  return (
    <div className="w-screen h-full text-white p-10 overflow-scroll">
      {data?.success ? (
        <>
          <div className="flex flex-col gap-2">
            <div className="text-md font-bold">Content :</div>
            <pre>{data?.data?.content}</pre>
          </div>
          <div className="text-white text-xs mt-20 flex flex-col gap-2">
            <div>Expiration: {data?.data?.expires_at ?? "No expiry"}</div>
            <div>
              Remaining views: {data?.data?.remaining_views ?? "No limit"}
            </div>
          </div>
        </>
      ) : (
        <div>
          <p className="text-center">Not found</p>
          <Link href={"/"}>
            <Button className="cursor-pointer">{<ArrowLeft />}</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Page;
