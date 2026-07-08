import Sidebar from "../../components/sidebar"
import Footer from "../../components/footer"

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-14">
        <Sidebar />
        <main className="min-w-0 py-10 md:py-14">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
