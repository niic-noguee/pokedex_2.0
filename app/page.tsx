import Link from 'next/link'
import { ArrowRight, Search, Users, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Bem-vindo à <span className="text-red-600">Pokedex</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          Explore o mundo dos Pokémon, cadastre-se e salve seus favoritos!
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/pokemons"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Explorar Pokémons <ArrowRight className="ml-2" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-red-600 bg-white border-2 border-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Users className="mr-2" /> Entrar / Cadastrar
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Funcionalidades</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Busca de Pokémons</h3>
              <p className="text-gray-600">
                Encontre qualquer Pokémon com nossa lista completa
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Sistema de Usuários</h3>
              <p className="text-gray-600">
                Cadastre-se e faça login para salvar seus pokémons favoritos
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Favoritos</h3>
              <p className="text-gray-600">
                Salve seus pokémons favoritos e acesse de qualquer lugar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Como funciona?</h2>
          <div className="max-w-3xl mx-auto">
            <ol className="list-decimal list-inside text-left space-y-4 text-lg">
              <li className="mb-2">👉 <strong>Cadastre-se</strong> na plataforma</li>
              <li className="mb-2">👉 <strong>Explore</strong> a lista de pokémons</li>
              <li className="mb-2">👉 <strong>Clique no coração</strong> para favoritar</li>
              <li className="mb-2">👉 <strong>Acesse "Favoritos"</strong> para ver sua coleção</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}