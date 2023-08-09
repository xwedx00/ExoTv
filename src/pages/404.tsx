import Button from "@/components/shared/Button";
import Head from "@/components/shared/Head";
import Section from "@/components/shared/Section";
import Link from "next/link";

function ErrorPage() {

  return (
    <div className="relative w-full min-h-screen flex items-center">
      <Head title="An error has occurred (404) - Exoexs" />

      <div className="fixed z-0 w-full h-full flex items-center justify-center">
        <h1 className="font-bold text-[30vw] text-gray-500">404</h1>

        <div className="absolute inset-0 bg-black/90 w-full h-full"></div>
      </div>

      <Section className="relative z-10 flex flex-col items-center w-full h-full text-center ">
        <div className="mb-4 text-gray-300">
          <span className="text-lg">
          Welcome to the 404 dimension
          </span>
        </div>

        <p className="text-4xl font-semibold">You have discovered a new dimension</p>

        <p className="text-2xl text-gray-200 mt-4">But unfortunately, this dimension has nothing at all</p>

        <Link href="/">
          <Button primary outline className="mt-8">
            <p className="text-lg">Go back to the old dimension</p>
          </Button>
        </Link>
      </Section>
    </div>
  );
}

ErrorPage.getLayout = (page: any) => page;

export default ErrorPage;
