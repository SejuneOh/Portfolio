import Link from "next/link"

export default function Footer() {

  return (
    <footer className="text-gray-600 dark:text-gray-100 body-font">
      <div className="bg-gray-100 dark:bg-slate-700/20">
        <div className="container px-5 py-6 mx-auto flex items-center sm:flex-row flex-col">
          <Link href={"/"} className="flex title-font font-medium items-center md:justify-start justify-center text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
              <path fill="#9fa8da" d="M9 39H12V41H9zM11 15H37V22H11z" /><path fill="#e8eaf6" d="M40 37L39 39 36 39 36 14 40 14z" /><path fill="#c5cae9" d="M36 24H40V34H36zM34 15v-4c0-5.5-4.5-10-10-10S14 5.5 14 11v4H34z" /><path fill="#3f51b5" d="M22 7H26V14H22z" /><path fill="#000001" d="M24 8A1 1 0 1 0 24 10A1 1 0 1 0 24 8Z" /><path fill="#ffff8d" d="M24.5 12A0.5 0.5 0 1 0 24.5 13A0.5 0.5 0 1 0 24.5 12Z" /><path fill="#7986cb" d="M28 11A1 1 0 1 0 28 13A1 1 0 1 0 28 11Z" /><path fill="#3f51b5" d="M31.119 4C29.302 2.152 26.78 1 24 1s-5.302 1.152-7.119 3H31.119zM34 11c0-.337-.018-.671-.051-1H30v4h4V11zM21.06 14v-4H14.11c-.033.329-.051.663-.051 1v3H21.06z" /><path fill="#e8eaf6" d="M13 14H35V37H13z" /><path fill="#3f51b5" d="M17 15H31V17H17zM17 18H31V20H17zM22 22H26V31H22zM22 33H26V37H22z" /><path fill="#90a4ae" d="M30 33H32V36H30zM15 32H17V36H15z" /><path fill="#cfd8dc" d="M24 23L24 23c.552 0 1 .448 1 1v1c0 .552-.448 1-1 1h0c-.552 0-1-.448-1-1v-1C23 23.448 23.448 23 24 23zM24 27L24 27c.552 0 1 .448 1 1v1c0 .552-.448 1-1 1h0c-.552 0-1-.448-1-1v-1C23 27.448 23.448 27 24 27z" /><path fill="#000001" d="M24 34A1 1 0 1 0 24 36A1 1 0 1 0 24 34Z" /><path fill="#9fa8da" d="M31 40L17 40 15 37 33 37z" /><path fill="#3f51b5" d="M40 16H41V20H40z" /><path fill="#e8eaf6" d="M8 37L9 39 12 39 12 14 8 14z" /><path fill="#c5cae9" d="M8 23H12V33H8z" /><path fill="#3f51b5" d="M7 16H8V20H7z" /><path fill="#c5cae9" d="M8 40L7 46 8 47 13 47 14 46 14 40z" /><path fill="#9fa8da" d="M13,45c-0.552,0-1-0.448-1-1v-5c0-0.55,0.45-1,1-1h0c0.55,0,1,0.45,1,1v5C14,44.552,13.552,45,13,45L13,45z" /><path fill="#8d6e63" d="M13,45h-3c-0.55,0-1-0.45-1-1l0,0c0-0.55,0.45-1,1-1h3c0.55,0,1,0.45,1,1l0,0C14,44.55,13.55,45,13,45z" /><path fill="#9fa8da" d="M36 39H39V41H36z" /><path fill="#c5cae9" d="M40 40L41 46 40 47 35 47 34 46 34 40z" /><path fill="#9fa8da" d="M35,45c0.552,0,1-0.448,1-1v-5c0-0.55-0.45-1-1-1l0,0c-0.55,0-1,0.45-1,1v5C34,44.552,34.448,45,35,45L35,45z" /><path fill="#8d6e63" d="M35,45h3c0.55,0,1-0.45,1-1l0,0c0-0.55-0.45-1-1-1h-3c-0.55,0-1,0.45-1,1l0,0C34,44.55,34.45,45,35,45z" />
            </svg>
            <span className="ml-3 text-xl">Portfolio</span>
          </Link>
          <p className="text-sm text-gray-500 sm:ml-6 sm:mt-0 mt-4">© 2023  Sejune—
            <a href="https://twitter.com/knyttneve" rel="noopener noreferrer" className="text-gray-600 ml-1" target="_blank">@DavidOh</a>
          </p>
          <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
            <Link href={"https://www.facebook.com/sejun.oh.9/"} className="text-gray-500">
              <svg fill="currentColor" strokeinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path>
              </svg>
            </Link>
            <Link href={"https://www.instagram.com/obari_7/"} className="ml-3 text-gray-500">
              <svg fill="none" stroke="currentColor" strokeinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path>
              </svg>
            </Link>
            <Link href="/" className="ml-3 text-gray-500">
              <svg fill="currentColor" stroke="currentColor" strokeinecap="round" strokeLinejoin="round" strokeWidth="0" className="w-5 h-5" viewBox="0 0 24 24">
                <path stroke="none" d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                <circle cx="4" cy="4" r="2" stroke="none"></circle>
              </svg>
            </Link>
          </span>
        </div>
      </div>
    </footer>
  )
}