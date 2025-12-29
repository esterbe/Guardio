import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchApi, formatDate, getTypeColor } from "@/lib/utils"
import {
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  Cpu,
  Heart,
} from "lucide-react"

interface CheckinsResponse {
  data: {
    period: string
    segment: string | null
    total: number
    successful: number
    failed: number
  }[]
  summary: {
    total_checkins: number
    successful: number
    failed: number
    success_rate: number
    active_checkins: number
  }
  filters: {
    start_date: string | null
    end_date: string | null
    group_by: string
    segment_by: string | null
  }
}

interface LeaderboardsResponse {
  top_pokemon: {
    id: number
    name: string
    type_primary: string
    type_secondary: string | null
    total_checkins: number
    successful_heals: number
    success_rate: number
  }[]
  top_types: {
    type: string
    total_checkins: number
    successful_heals: number
    success_rate: number
  }[]
}

interface MachinesResponse {
  machines: {
    id: number
    name: string
    model: string
    location: string
    total_checkins: number
    success_rate: number
    successful: number
    failed: number
    avg_healing_time_minutes: number
  }[]
}

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [checkins, setCheckins] = useState<CheckinsResponse | null>(null)
  const [leaderboards, setLeaderboards] = useState<LeaderboardsResponse | null>(null)
  const [machines, setMachines] = useState<MachinesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter state from URL params
  const startDate = searchParams.get("start") || ""
  const endDate = searchParams.get("end") || ""
  const groupBy = searchParams.get("groupBy") || "day"
  const segmentBy = searchParams.get("segmentBy") || ""

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const newParams = new URLSearchParams(searchParams)
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams]
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (startDate) params.set("start_date", startDate)
      if (endDate) params.set("end_date", endDate)
      params.set("group_by", groupBy)
      if (segmentBy) params.set("segment_by", segmentBy)

      const [checkinsData, leaderboardsData, machinesData] = await Promise.all([
        fetchApi<CheckinsResponse>(`/metrics/checkins?${params}`),
        fetchApi<LeaderboardsResponse>("/leaderboards?limit=5"),
        fetchApi<MachinesResponse>("/metrics/machines"),
      ])

      setCheckins(checkinsData)
      setLeaderboards(leaderboardsData)
      setMachines(machinesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, groupBy, segmentBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Find top performing machine
  const topMachine = machines?.machines.reduce((best, current) =>
    (current.success_rate || 0) > (best?.success_rate || 0) ? current : best
  , machines.machines[0])

  // Prepare chart data
  const chartData = checkins?.data.map((d) => ({
    ...d,
    period: groupBy === "hour" ? d.period.split(" ")[1] || d.period : formatDate(d.period),
  }))

  // Get unique segments for multi-line chart
  const segments = [...new Set(checkins?.data.map((d) => d.segment).filter(Boolean))]

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Error loading dashboard</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-lg">
          Pokemon Center healing activity at a glance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <div className="text-4xl font-bold">
                {checkins?.summary.total_checkins.toLocaleString()}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {startDate || endDate ? "Filtered period" : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="text-4xl font-bold text-green-500">
                {checkins?.summary.success_rate}%
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {checkins?.summary.successful.toLocaleString()} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Check-ins</CardTitle>
            <Heart className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-16" />
            ) : (
              <div className="text-4xl font-bold text-primary">
                {checkins?.summary.active_checkins}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">Currently healing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Machine</CardTitle>
            <Cpu className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-2xl font-bold truncate">{topMachine?.name}</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {topMachine?.success_rate}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Check-ins Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Check-ins Trend</CardTitle>
              <p className="text-muted-foreground">
                Healing activity over time
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => updateFilter("start", e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="end-date" className="text-xs">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => updateFilter("end", e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Group By</Label>
                <Select value={groupBy} onValueChange={(v) => updateFilter("groupBy", v)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Segment By</Label>
                <Select value={segmentBy || "none"} onValueChange={(v) => updateFilter("segmentBy", v === "none" ? "" : v)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="pokemon">Pokemon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              {segmentBy && segments.length > 0 ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {segments.slice(0, 8).map((segment, index) => (
                    <Bar
                      key={segment}
                      dataKey={(d: typeof chartData[0]) => d.segment === segment ? d.total : 0}
                      name={segment || "Unknown"}
                      fill={segmentBy === "type" ? getTypeColor(segment || "") : `hsl(${index * 45}, 70%, 50%)`}
                      stackId="stack"
                    />
                  ))}
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="successful"
                    name="Successful"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    name="Failed"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Pokemon by Heals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboards?.top_pokemon.map((pokemon, index) => (
                  <div
                    key={pokemon.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{pokemon.name}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge
                            style={{ backgroundColor: getTypeColor(pokemon.type_primary) }}
                            className="text-white text-xs"
                          >
                            {pokemon.type_primary}
                          </Badge>
                          {pokemon.type_secondary && (
                            <Badge
                              style={{ backgroundColor: getTypeColor(pokemon.type_secondary) }}
                              className="text-white text-xs"
                            >
                              {pokemon.type_secondary}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{pokemon.successful_heals}</p>
                      <p className="text-xs text-muted-foreground">heals</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Types by Heals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboards?.top_types.map((type, index) => (
                  <div
                    key={type.type}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        #{index + 1}
                      </span>
                      <Badge
                        style={{ backgroundColor: getTypeColor(type.type) }}
                        className="text-white px-3 py-1 text-sm capitalize"
                      >
                        {type.type}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{type.successful_heals.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        {type.success_rate}% success
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
