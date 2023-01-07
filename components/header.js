import Link from "next/link"
import DarkModeToggleBtn from "./darkModeToggleBtn"

export default function Header() {

  return <>
    <header className="text-gray-600 body-font">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href="/">
          <span className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-10 h-10 text-white p-2 bg-indigo-500 rounded-full" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="ml-3 text-xl">포트폴리오</h1>
          </span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          <Link href="/">
            <span className="mr-5 hover:text-gray-900" >Home</span>
          </Link>
          <Link href="/projects">
            <span className="mr-5 hover:text-gray-900" > 프로젝트</span>
          </Link>
          <Link href="/">
            <span className="mr-5 hover:text-gray-900">연락하기</span>
          </Link>
        </nav>
        {/* todo dark mod */}
        <DarkModeToggleBtn />
      </div>
    </header>
  </>
}