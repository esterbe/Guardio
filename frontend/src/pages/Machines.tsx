import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchApi, formatDateTime, getTypeColor } from "@/lib/utils"
import {
  Cpu,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Machine {
  id: number
  name: string
  model: string
  location: string
  total_checkins: number
  success_rate: number
  successful: number
  failed: number
  avg_healing_time_minutes: number
  current_patients: {
    pokemon_name: string
    type_primary: string
    type_secondary: string | null
    arrived_at: string
    initial_hp: number
    max_hp: number
    checkin_id: number
  }[]
}

interface MachinesResponse {
  machines: Machine[]
}

interface CompareMachine extends Machine {
  success_rate_delta: number
  checkins_delta: number
  healing_time_delta: number
  is_baseline: number
}

interface CompareResponse {
  baseline_id: number
  machines: CompareMachine[]
}

export function Machines() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [machines, setMachines] = useState<MachinesResponse | null>(null)
  const [compareData, setCompareData] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const baselineId = searchParams.get("baseline") || ""

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [machinesData, compareDataResult] = await Promise.all([
        fetchApi<MachinesResponse>("/metrics/machines"),
        baselineId
          ? fetchApi<CompareResponse>(`/metrics/machines/compare?baseline_id=${baselineId}`)
          : Promise.resolve(null),
      ])

      setMachines(machinesData)
      setCompareData(compareDataResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [baselineId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBaselineChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value && value !== "none") {
      newParams.set("baseline", value)
    } else {
      newParams.delete("baseline")
    }
    setSearchParams(newParams)
  }

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const formatDelta = (delta: number, suffix: string = "") => {
    if (delta === 0) return "-"
    const sign = delta > 0 ? "+" : ""
    return `${sign}${delta.toFixed(1)}${suffix}`
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Error loading machines</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  // Use compare data if available, otherwise use regular machines data
  const displayMachines: (Machine | CompareMachine)[] = compareData?.machines || machines?.machines || []

  const isCompareMachine = (m: Machine | CompareMachine): m is CompareMachine => {
    return "success_rate_delta" in m
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Machine Metrics</h1>
        <p className="text-muted-foreground text-lg">
          Performance statistics for all healing machines
        </p>
      </div>

      {/* Comparison Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Compare Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Select a baseline machine to compare:
            </span>
            <Select value={baselineId || "none"} onValueChange={handleBaselineChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select baseline..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No comparison</SelectItem>
                {machines?.machines.map((machine) => (
                  <SelectItem key={machine.id} value={machine.id.toString()}>
                    {machine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {baselineId && (
              <span className="text-xs text-muted-foreground">
                Showing deltas relative to baseline
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Machines Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Machines</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Machine</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Check-ins</TableHead>
                  <TableHead className="text-right">Success Rate</TableHead>
                  <TableHead className="text-right">Avg. Time</TableHead>
                  <TableHead>Current Patient</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMachines.map((machine) => {
                  const compareM = isCompareMachine(machine) ? machine : null
                  const isBaseline = compareM?.is_baseline

                  return (
                    <TableRow
                      key={machine.id}
                      className={isBaseline ? "bg-primary/5" : ""}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold flex items-center gap-2">
                            {machine.name}
                            {isBaseline ? (
                              <Badge variant="secondary" className="text-xs">
                                Baseline
                              </Badge>
                            ) : null}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {machine.model}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {machine.location}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium">
                            {machine.total_checkins.toLocaleString()}
                          </span>
                          {compareM && !isBaseline && (
                            <span className="flex items-center text-xs">
                              {getDeltaIcon(compareM.checkins_delta)}
                              <span className="ml-1">
                                {formatDelta(compareM.checkins_delta)}
                              </span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={`font-medium ${
                              machine.success_rate >= 90
                                ? "text-green-500"
                                : machine.success_rate >= 80
                                ? "text-yellow-500"
                                : "text-red-500"
                            }`}
                          >
                            {machine.success_rate}%
                          </span>
                          {compareM && !isBaseline && (
                            <span className="flex items-center text-xs">
                              {getDeltaIcon(compareM.success_rate_delta)}
                              <span className="ml-1">
                                {formatDelta(compareM.success_rate_delta, "%")}
                              </span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{machine.avg_healing_time_minutes?.toFixed(0) || "-"} min</span>
                          {compareM && !isBaseline && compareM.healing_time_delta && (
                            <span className="flex items-center text-xs">
                              {getDeltaIcon(-compareM.healing_time_delta)}
                              <span className="ml-1">
                                {formatDelta(compareM.healing_time_delta, " min")}
                              </span>
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {machine.current_patients && machine.current_patients.length > 0 ? (
                          <div className="space-y-2">
                            {machine.current_patients.slice(0, 2).map((patient) => (
                              <div
                                key={patient.checkin_id}
                                className="flex items-center gap-2 text-sm"
                              >
                                <span className="font-medium">{patient.pokemon_name}</span>
                                <Badge
                                  style={{ backgroundColor: getTypeColor(patient.type_primary) }}
                                  className="text-white text-xs"
                                >
                                  {patient.type_primary}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatDateTime(patient.arrived_at)}
                                </span>
                              </div>
                            ))}
                            {machine.current_patients.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{machine.current_patients.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Available
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
