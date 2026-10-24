import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[80svh] flex-col items-center justify-center pt-14 text-center">
      <p className="eyebrow">404</p>
      <h1 className="headline mt-3 text-5xl md:text-7xl">Page not found.</h1>
      <p className="mt-4 max-w-md text-lg text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-10 flex items-center gap-6">
        <Link href="/" className="btn btn-brand">
          Go home
        </Link>
        <Link href="/shop" className="link text-[17px]">
          Shop ›
        </Link>
      </div>
    </div>
  );
}
