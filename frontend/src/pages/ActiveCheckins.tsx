import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchApi, formatDateTime, getTypeColor } from "@/lib/utils"
import {
  Activity,
  Heart,
  Clock,
  MapPin,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ActiveCheckin {
  id: number
  pokemon_id: number
  pokemon_name: string
  type_primary: string
  type_secondary: string | null
  machine_id: number
  machine_name: string
  machine_location: string
  arrived_at: string
  initial_hp: number
  max_hp: number
  minutes_in_treatment: number
}

interface ActiveCheckinsResponse {
  active_checkins: ActiveCheckin[]
  count: number
}

export function ActiveCheckins() {
  const [checkins, setCheckins] = useState<ActiveCheckinsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dismiss dialog state
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false)
  const [selectedCheckin, setSelectedCheckin] = useState<ActiveCheckin | null>(null)
  const [dismissOutcome, setDismissOutcome] = useState<"success" | "fail">("success")
  const [dismissing, setDismissing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApi<ActiveCheckinsResponse>("/checkins/active")
      setCheckins(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openDismissDialog = (checkin: ActiveCheckin) => {
    setSelectedCheckin(checkin)
    setDismissOutcome("success")
    setDismissDialogOpen(true)
  }

  const handleDismiss = async () => {
    if (!selectedCheckin) return

    setDismissing(true)
    try {
      await fetchApi(`/checkins/dismiss/${selectedCheckin.id}?outcome=${dismissOutcome}`, {
        method: "POST",
      })

      // Update local state immediately
      setCheckins((prev) =>
        prev
          ? {
              ...prev,
              active_checkins: prev.active_checkins.filter(
                (c) => c.id !== selectedCheckin.id
              ),
              count: prev.count - 1,
            }
          : null
      )

      setDismissDialogOpen(false)
      setSelectedCheckin(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to dismiss check-in")
    } finally {
      setDismissing(false)
    }
  }

  const formatTreatmentTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  if (error && !checkins) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="p-6">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="text-lg font-semibold">Error loading active check-ins</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Active Check-ins</h1>
        <p className="text-muted-foreground text-lg">
          Pokemon currently being treated at the center
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Currently Treating</CardTitle>
          <Heart className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-9 w-16" />
          ) : (
            <div className="text-4xl font-bold text-primary">
              {checkins?.count || 0}
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-1">Pokemon in healing machines</p>
        </CardContent>
      </Card>

      {/* Active Check-ins List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : checkins?.active_checkins && checkins.active_checkins.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {checkins.active_checkins.map((checkin) => (
            <Card key={checkin.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{checkin.pokemon_name}</CardTitle>
                    <div className="flex gap-1 mt-2">
                      <Badge
                        style={{ backgroundColor: getTypeColor(checkin.type_primary) }}
                        className="text-white"
                      >
                        {checkin.type_primary}
                      </Badge>
                      {checkin.type_secondary && (
                        <Badge
                          style={{ backgroundColor: getTypeColor(checkin.type_secondary) }}
                          className="text-white"
                        >
                          {checkin.type_secondary}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {checkin.initial_hp}/{checkin.max_hp}
                    </span>
                    <p className="text-xs text-muted-foreground">HP</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Machine:</span>
                  <span className="font-medium">{checkin.machine_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>{checkin.machine_location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Arrived:</span>
                  <span>{formatDateTime(checkin.arrived_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-muted-foreground">In treatment:</span>
                  <span className="font-medium text-yellow-600">
                    {formatTreatmentTime(checkin.minutes_in_treatment)}
                  </span>
                </div>

                {/* HP Bar */}
                <div className="mt-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{
                        width: `${(checkin.initial_hp / checkin.max_hp) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => openDismissDialog(checkin)}
                >
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">
              No Pokemon are currently being treated. All healing machines are available.
            </p>
          </div>
        </Card>
      )}

      {/* Dismiss Confirmation Dialog */}
      <Dialog open={dismissDialogOpen} onOpenChange={setDismissDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dismiss Check-in</DialogTitle>
            <DialogDescription>
              Mark {selectedCheckin?.pokemon_name}'s treatment as complete.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{selectedCheckin?.pokemon_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCheckin?.machine_name} - {selectedCheckin?.machine_location}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Treatment Outcome</label>
              <Select
                value={dismissOutcome}
                onValueChange={(v: "success" | "fail") => setDismissOutcome(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Success - Fully Healed</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="fail">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>Failed - Treatment Unsuccessful</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDismissDialogOpen(false)}
              disabled={dismissing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDismiss}
              disabled={dismissing}
              variant={dismissOutcome === "success" ? "default" : "destructive"}
            >
              {dismissing ? "Dismissing..." : "Confirm Dismiss"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
