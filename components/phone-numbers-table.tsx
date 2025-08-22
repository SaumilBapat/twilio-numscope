"use client"

import { useState } from "react"
import { Box } from "@twilio-paste/core/box"
import { Button } from "@twilio-paste/core/button"
import { Card } from "@twilio-paste/core/card"
import { Heading } from "@twilio-paste/core/heading"
import { Text } from "@twilio-paste/core/text"
import { Badge } from "@twilio-paste/core/badge"
import { Input } from "@twilio-paste/core/input"
import { Label } from "@twilio-paste/core/label"
import { Table, THead, TBody, Tr, Th, Td } from "@twilio-paste/core/table"
import { Stack } from "@twilio-paste/core/stack"
import { Modal, ModalBody, ModalFooter, ModalFooterActions, ModalHeader, ModalHeading } from "@twilio-paste/core/modal"
import { SearchIcon } from "@twilio-paste/icons/esm/SearchIcon"
import { ProductPhoneNumbersIcon } from "@twilio-paste/icons/esm/ProductPhoneNumbersIcon"

interface RecommendedNumber {
  geo: string
  type: string
  smsEnabled: boolean
  voiceEnabled: boolean
  considerations: string
  restrictions: string
}



interface PhoneNumbersTableProps {
  requirements?: {
    smsType?: string
    useCase?: string
    businessPresence?: string
    voiceRequired?: string
  }
  recommendedNumbers?: RecommendedNumber[]
  compact?: boolean
}

export function PhoneNumbersTable({ requirements, recommendedNumbers = [], compact = false }: PhoneNumbersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedNumber, setSelectedNumber] = useState<RecommendedNumber | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewMore = (number: RecommendedNumber) => {
    setSelectedNumber(number)
    setIsModalOpen(true)
  }

  const filteredNumbers = recommendedNumbers.filter((number) => {
    const matchesSearch = 
      number.geo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      number.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === "all" || number.type.toLowerCase() === filterType
    
    return matchesSearch && matchesFilter
  })

  const getAvailableTypes = () => {
    const types = new Set(recommendedNumbers.map(n => n.type.toLowerCase()))
    return Array.from(types)
  }

  return (
    <>
      <Card padding="space0">
        <Box 
          padding={compact ? "space20" : "space50"}
          borderBottomWidth="borderWidth10" 
          borderBottomColor="colorBorderWeaker" 
          borderBottomStyle="solid"
          backgroundColor="colorBackgroundWeak"
        >
          <Stack orientation="vertical" spacing={compact ? "space20" : "space40"}>
            <Heading as="h3" variant={compact ? "heading30" : "heading40"}>Recommended Numbers</Heading>
            
            {!compact && recommendedNumbers.length > 0 && (
              <Stack orientation="vertical" spacing="space30">
                <Box position="relative">
                  <Label htmlFor="search">Search recommendations</Label>
                  <Input
                    id="search"
                    type="search"
                    placeholder="Search by country or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    insertBefore={<SearchIcon decorative />}
                  />
                </Box>
                
                <Stack orientation="horizontal" spacing="space20">
                  <Button
                    variant={filterType === "all" ? "primary" : "secondary"}
                    size="small"
                    onClick={() => setFilterType("all")}
                  >
                    All
                  </Button>
                  {getAvailableTypes().map(type => (
                    <Button
                      key={type}
                      variant={filterType === type ? "primary" : "secondary"}
                      size="small"
                      onClick={() => setFilterType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </Box>

        <Box height={compact ? "calc(100vh - 200px)" : "60vh"} overflow="auto">
          {recommendedNumbers.length === 0 ? (
            <Box paddingY="space50" textAlign="center">
              <Text as="span" color="colorTextWeak" fontSize="fontSize20">
                Ask a question to get number recommendations
              </Text>
            </Box>
          ) : compact ? (
            // Compact card-based layout for sidebar
            <Box padding="space40">
              <Stack orientation="vertical" spacing="space50">
                {filteredNumbers.slice(0, 6).map((number, index) => (
                  <Box
                    key={index}
                    padding="space50"
                    borderRadius="borderRadius30"
                    backgroundColor="colorBackgroundBody"
                    borderWidth="borderWidth10"
                    borderColor="colorBorderWeak"
                    borderStyle="solid"
                    boxShadow="shadowBorder"
                  >
                    <Stack orientation="vertical" spacing="space40">
                      <Text as="span" fontSize="fontSize40" fontWeight="fontWeightSemibold" lineHeight="lineHeight30">
                        {number.geo} {number.type}
                      </Text>
                      <Stack orientation="horizontal" spacing="space30">
                        {number.smsEnabled && (
                          <Badge variant="success" as="span" size="default">SMS</Badge>
                        )}
                        {number.voiceEnabled && (
                          <Badge variant="success" as="span" size="default">Voice</Badge>
                        )}
                      </Stack>
                      <Box marginTop="space30">
                        <Button 
                          variant="secondary" 
                          size="default"
                          onClick={() => handleViewMore(number)}
                          width="100%"
                        >
                          View Details
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                ))}
                {filteredNumbers.length === 0 && (
                  <Box paddingY="space50" textAlign="center">
                    <Text as="span" color="colorTextWeak" fontSize="fontSize20">
                      No recommendations match your filter
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          ) : (
            // Full table layout
            <Table>
              <THead>
                <Tr>
                  <Th textAlign="left">Location & Type</Th>
                  <Th textAlign="left">Features</Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {filteredNumbers.map((number, index) => (
                  <Tr key={index}>
                    <Td>
                      <Stack orientation="vertical" spacing="space20">
                        <Text as="span" fontWeight="fontWeightMedium">
                          {number.geo}
                        </Text>
                        <Text as="span" fontSize="fontSize20" color="colorTextWeak" textTransform="capitalize">
                          {number.type}
                        </Text>
                      </Stack>
                    </Td>
                    <Td>
                      <Stack orientation="horizontal" spacing="space20">
                        {number.smsEnabled && (
                          <Badge variant="success" as="span">SMS</Badge>
                        )}
                        {number.voiceEnabled && (
                          <Badge variant="success" as="span">Voice</Badge>
                        )}
                      </Stack>
                    </Td>
                    <Td textAlign="center">
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => handleViewMore(number)}
                      >
                        View More
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {filteredNumbers.length === 0 && (
                  <Tr>
                    <Td colSpan={3} textAlign="center">
                      <Box paddingY="space70">
                        <Text as="span" color="colorTextWeak">
                          No recommendations match your criteria
                        </Text>
                      </Box>
                    </Td>
                  </Tr>
                )}
              </TBody>
            </Table>
          )}
        </Box>
      </Card>

      {/* Details Modal */}
      <Modal 
        ariaLabelledby="number-details-modal"
        isOpen={isModalOpen}
        onDismiss={() => setIsModalOpen(false)}
        size="default"
      >
        <ModalHeader>
          <ModalHeading as="h3" id="number-details-modal">
            {selectedNumber?.geo} {selectedNumber?.type} Details
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          {selectedNumber && (
            <Stack orientation="vertical" spacing="space40">
              <Box>
                <Heading as="h4" variant="heading50" marginBottom="space20">
                  Features
                </Heading>
                <Stack orientation="horizontal" spacing="space20">
                  {selectedNumber.smsEnabled && (
                    <Badge variant="success" as="span">SMS Enabled</Badge>
                  )}
                  {selectedNumber.voiceEnabled && (
                    <Badge variant="success" as="span">Voice Enabled</Badge>
                  )}
                </Stack>
              </Box>
              
              {selectedNumber.considerations && (
                <Box>
                  <Heading as="h4" variant="heading50" marginBottom="space20">
                    Considerations
                  </Heading>
                  <Text as="p">{selectedNumber.considerations}</Text>
                </Box>
              )}
              
              {selectedNumber.restrictions && (
                <Box>
                  <Heading as="h4" variant="heading50" marginBottom="space20">
                    Restrictions
                  </Heading>
                  <Text as="p">{selectedNumber.restrictions}</Text>
                </Box>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </>
  )
}