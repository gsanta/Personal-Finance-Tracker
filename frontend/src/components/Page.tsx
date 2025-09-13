import { ReactNode } from 'react';

type PageProps = {
  children: ReactNode;
};

const Page = ({ children }: PageProps) => {
  return (
    <div className="bg-base-200 flex justify-around min-h-screen">
      <div className="max-w-7xl w-full border-x border-primary border-dashed">
        <div className="flex items-center justify-between gap-4 px-8 ps-10 w-full pt-4">
          <h2 className="font-title text-lg">Personal finance tracker</h2>
          <div className="flex gap-1 bg-base-300 p-3 rounded-lg">
            <a className="link link-hover" href="payments">
              Payments
            </a>
            <div className="divider divider-horizontal divider-primary"></div>
            <a className="link link-hover" href="summaries">
              Summaries
            </a>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Page;
