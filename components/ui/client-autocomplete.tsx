"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Client {
  id: string
  name: string
  email: string
  status: "active" | "overdue" | "inactive"
}

interface ClientAutocompleteProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  className?: string
}

// TODO: Implementar busca de clientes reais da API
const mockClients: Client[] = []

export function ClientAutocomplete({
  value,
  onValueChange,
  placeholder = "Selecione um cliente...",
  className,
}: ClientAutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const selectedClient = mockClients.find((client: any) => client.name === value)

  const filteredClients = mockClients.filter(
    (client: any) => client.status !== "inactive" && client.name.toLowerCase().includes(searchValue.toLowerCase()),
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            {selectedClient ? (
              <div className="flex flex-col">
                <span className="text-sm">{selectedClient.name}</span>
                <span className="text-xs text-muted-foreground">{selectedClient.email}</span>
              </div>
            ) : (
              placeholder
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar cliente..." value={searchValue} onValueChange={setSearchValue} />
          <CommandList>
            <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
            <CommandGroup>
              {filteredClients.map((client) => (
                <CommandItem
                  key={client.id}
                  value={client.name}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    setSearchValue("")
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{client.name}</span>
                      <span className="text-xs text-muted-foreground">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          client.status === "active" && "bg-green-100 text-green-700",
                          client.status === "overdue" && "bg-red-100 text-red-700",
                        )}
                      >
                        {client.status === "active" ? "Em dia" : "Atrasado"}
                      </span>
                      <Check className={cn("ml-auto h-4 w-4", value === client.name ? "opacity-100" : "opacity-0")} />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
