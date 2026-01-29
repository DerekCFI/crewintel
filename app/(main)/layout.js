import Header from '../components/Header'
import Footer from '../components/Footer'
import FeedbackButton from '../components/FeedbackButton'

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <FeedbackButton />
    </div>
  )
}
