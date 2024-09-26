'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Stripe } from '@/components/stripe'
import { StripeCheckout } from '@/components/stripe'
import Confetti from 'react-confetti-boom';


const GRID_WIDTH = 200
const GRID_HEIGHT = 75
const INITIAL_PRICE = 1

export default function Home() {
  const [grid, setGrid] = useState(Array(GRID_WIDTH * GRID_HEIGHT).fill(null))
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', url: '', purpose: '', email: '' })
  const [currentPrice, setCurrentPrice] = useState(INITIAL_PRICE)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const [isMagnifierVisible, setIsMagnifierVisible] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [isExploiding,setIsExploiding] = useState(false);


  const handleCellClick = (index: number) => {
    setSelectedCell(index)
    setIsModalOpen(true)
  }

  const handleLinkClick = () => {
    setGrid(prevGrid => 
      prevGrid.map((cell, index) => 
        index === selectedCell ? { ...cell, clickCount: (cell.clickCount || 0) + 1 } : cell
      )
    );
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    const { title, url, purpose, email } = formData

    if (!title) errors.title = 'Title is required'
    if (!url) errors.url = 'URL is required'
    if (!purpose) errors.purpose = 'Purpose is required'
    if (!email) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Email format is invalid'

    return errors
  }

  const handleFormSubmit = async () => {
    // Here you would integrate with Stripe for payment
    // For now, we'll just simulate a successful purchase

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const newGrid = [...grid]
    newGrid[selectedCell!] = formData
    setGrid(newGrid)
    setIsModalOpen(false)
    setFormData({ title: '', url: '', purpose: '', email: '' });
    setCurrentPrice(currentPrice * 1.1) // Increase price by 10%
  }

  const handleGiveMeALink = () => {
    const purchasedCells = grid.reduce((acc, cell, index) => cell ? [...acc, index] : acc, []);
    if (purchasedCells.length === 0) return;
  
    let intervalId: NodeJS.Timeout;
    let randomIndex = Math.floor(Math.random() * purchasedCells.length);
  
    // Rastgele bir hücreyi seçmeye başla ve sürekli gezdir
    intervalId = setInterval(() => {
      const cellIndex = purchasedCells[randomIndex];
      setGrid(prevGrid => 
        prevGrid.map((cell, index) => 
          index === cellIndex ? { ...cell, temporaryColor: '#FFFF00' } : cell
        )
      );
  
      // Bir önceki hücrenin rengini tekrar normale döndür
      setTimeout(() => {
        setGrid(prevGrid => 
          prevGrid.map((cell, index) => 
            index === cellIndex ? { ...cell, temporaryColor: null } : cell
          )
        );
      }, 300); // Her hücre için sarı rengi 0.3 saniye boyunca göster
  
      // Sonra random bir şekilde bir sonraki hücreye geç
      randomIndex = Math.floor(Math.random() * purchasedCells.length);
    }, 300); // Hücreyi her 0.3 saniyede bir rastgele değiştirmeye devam et
  
    // Verilen süre sonunda hücrelerin dolaşması bitir
    setTimeout(() => {
      clearInterval(intervalId);
      
      const finalCellIndex = purchasedCells[randomIndex];
      setSelectedCell(finalCellIndex);
      setIsModalOpen(true);
      setIsExploiding(true);      
    }, 5000); // Süre 5 saniye (5000 ms) olarak ayarlandı

  };
  

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        const { width } = gridRef.current.getBoundingClientRect()
        gridRef.current.style.height = `${width}px`
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4">
      <header className="w-full text-center mb-4">
        <h1 className="text-4xl font-bold">adyour.link</h1>
      </header>

      <Button onClick={handleGiveMeALink} className="mb-4">Give me a link</Button>

      <div 
        ref={gridRef}
        className="relative w-[calc(100vw-2rem)] max-h-[calc(100vh-12rem)] border border-gray-200 overflow-hidden"        
        style={{
          aspectRatio: `${GRID_WIDTH} / ${GRID_HEIGHT}`,
        }}
      >
          <div 
            className="grid w-full h-full" 
            style={{
            gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`,
          }}>
          {grid.map((cell, index) => (
            <div
              key={index}
              className={`border border-gray-300 cursor-pointer`}
              style={{
                backgroundColor: cell?.temporaryColor || (cell ? '#3b82f6' : '#e5e7eb'),
              }}
              onClick={() => handleCellClick(index)}
            />
          ))}
        </div>
        {isMagnifierVisible && (
          <div 
            className="absolute w-20 h-20 border-2 border-black rounded-full overflow-hidden pointer-events-none"
            style={{
              left: magnifierPosition.x - 40,
              top: magnifierPosition.y - 40,
              backgroundImage: `linear-gradient(to right, transparent 49%, black 49%, black 51%, transparent 51%),
                               linear-gradient(to bottom, transparent 49%, black 49%, black 51%, transparent 51%)`,
              backgroundSize: '10% 10%',
              backgroundPosition: 'center',
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `linear-gradient(${grid.map((cell, index) => 
                  `${index % GRID_WIDTH === 0 ? (index === 0 ? '' : ',') : ''} ${cell ? '#3b82f6' : '#e5e7eb'} ${index % GRID_WIDTH}% ${(index % GRID_WIDTH) + 1}%`
                ).join(',')})`,
                backgroundSize: `${GRID_WIDTH * 3}% ${GRID_HEIGHT * 3}%`, // Increase the background size for more zoom
                backgroundPosition: `${-magnifierPosition.x * 3 + 100}% ${-magnifierPosition.y * 3 + 100}%`, // Adjust position accordingly
                transform: 'scale(5)', // Increase the scale for more zoom
                transformOrigin: 'center',
              }}
            />
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          style={{
            backgroundColor: '#ffffff', // Beyaz arka plan rengi
            color: '#000000', // Siyah yazı rengi
            padding: '16px',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // İçeriği ortalar
            width: '100%', // İçerik genişliği ekledik
            maxWidth: '500px', // Maksimum genişliği 500px ile sınırlıyoruz
            margin: '0 auto', // Ortalamak için margin ayarladık
          }}
        >
          <DialogHeader
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center', // Header içeriğini ortalar
              marginBottom: '16px',
            }}
          >
          <DialogTitle style={{ textAlign: 'center' }}>{grid[selectedCell!] ? 'Link Details' : 'Purchase This Cell'}</DialogTitle>
          </DialogHeader>
          {selectedCell !== null && grid[selectedCell] ? (
            <div style={{ textAlign: 'center', border: '1px solid #D1D5DB', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ marginBottom:'25px' }}>
              <a
                href={grid[selectedCell].url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick} // Link tıklama olayını işleyin
                style={{
                  textDecoration: 'underline',
                  fontSize: '24px', // Font boyutunu büyüttük
                  paddingBottom: '5px',
                  color: '#1F2937', // Bağlantı rengini koyu gri
                  textShadow: '0 1px 3px rgba(0, 255, 255, 0.8)' // Turkuaz mavi ışıltı
                }}
              >
                {grid[selectedCell].title}
              </a>
            </div>
            <p style={{ color: '#4B5563', fontSize: '16px', marginBottom: '30px' }}>
              {grid[selectedCell].purpose}
            </p>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              Clicked {grid[selectedCell].clickCount || 0} times
            </p>
          </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4" style={{ width: '100%' }}>
              <div>
                <Label htmlFor="title">Link Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>
              <div>
                <Label htmlFor="url">Link URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  required
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>
              <div>
                <Label htmlFor="purpose">Link Purpose</Label>
                <Textarea
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  required
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ backgroundColor: '#ffffff', color: '#000000' }}
                />
              </div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                <Stripe>
                  <StripeCheckout
                    amount={currentPrice * 100} // Stripe expects amount in cents
                    currency="USD"
                    onSuccess={handleFormSubmit}
                  >
                    <Button type="submit">Checkout (${currentPrice.toFixed(2)})</Button>
                  </StripeCheckout>
                </Stripe>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog> 



      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mt-4">What is this?</Button>
        </DialogTrigger>
        <DialogContent
          style={{
            backgroundColor: '#ffffff', // Beyaz arka plan rengi
            color: '#000000', // Siyah yazı rengi
            padding: '16px',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto',
          }}
        >
          <DialogHeader
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center', // Header içeriğini ortalar
              marginBottom: '16px',
            }}
          >
            <DialogTitle style={{ textAlign: 'center' }}>What is adyour.link?</DialogTitle>
          </DialogHeader>
          <p style={{ textAlign: 'center', color: '#4b5563' }}>
            adyour.link is an internet experiment aimed at creating a unique space for link sharing and discovery.
            Users can purchase individual cells in our 100x100 grid, each representing a link to content they want to share.
          </p>
        </DialogContent>
      </Dialog>

    </div>
  )
}
