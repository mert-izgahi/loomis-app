import { cn } from "@/lib/utils";
import Link from "next/link";

export const MetricCard = ({
  title,
  count,
  icon,
  href,
  className
}: {
  title: string;
  count?: number;
  icon: React.ReactNode;
  href?: string;
  className?: string;
}) => {
  if(!href) {
    return (
      <div className={cn("rounded-md flex border-1 shadow-sm bg-white bg-[linear-gradient(90deg,#ffffff_55%,#f5f5f5_100%)]",className)}>
        <div className="flex !justify-start px-4 py-3 w-full rounded-l-xl !items-center gap-x-3 col-span-4">
          {icon}
          <h3 className="text-xs md:text-sm font-semibold">{title}</h3>
        </div>
        {
          count && <p className="text-xs  md:text-sm font-bold  w-full flex justify-end px-4 items-center">{count}</p>
        }
      </div>
    );
  }
  return (
    <Link href={href} className={cn("rounded-md flex border-1 shadow-sm bg-white bg-[linear-gradient(90deg,#ffffff_55%,#f5f5f5_100%)] hover:scale-90 transition-transform duration-200 ease-in-out",className)}>
      <div className="flex !justify-start px-4 py-3  w-full rounded-l-xl !items-center gap-x-3 col-span-4">
        {icon}
        <h3 className="text-xs md:text-sm font-semibold  flex-1">{title}</h3>
      </div>
      {
        count && <p className="text-xs md:text-sm font-bold  w-full flex justify-end px-4 items-center">{count}</p>
      }
    </Link>
  );
};

