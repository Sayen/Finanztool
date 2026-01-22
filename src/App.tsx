import { HashRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { RentVsOwn } from './pages/RentVsOwn'
import { BudgetPlanner } from './pages/BudgetPlanner'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/rent-vs-own" element={<RentVsOwn />} />
          <Route path="/budget-planner" element={<BudgetPlanner />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
