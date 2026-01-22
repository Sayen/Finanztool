import { useState } from 'react'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'

export function AuthPage() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-center">Benutzerkonto</h1>

      <div className="bg-card border rounded-lg p-6 w-full max-w-md shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                    value="login"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'login' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                    Anmelden
                </TabsTrigger>
                <TabsTrigger
                    value="register"
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'register' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                    Registrieren
                </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <LoginForm />
            </TabsContent>
            <TabsContent value="register">
                <RegisterForm />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
