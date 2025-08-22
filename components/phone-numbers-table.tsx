
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
  status?: string
  smsEnabled: boolean
  voiceEnabled: boolean
  considerations: string
  restrictions?: string
}

interface PhoneNumbersTableProps {
  requirements: {
    smsType: string
    useCase: string
    businessPresence: string
    voiceRequired: string
  }
  recommendedNumbers: RecommendedNumber[]
  compact?: boolean
}

export function PhoneNumbersTable({ 
  requirements, 
  recommendedNumbers, 
  compact = false 
}: PhoneNumbersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNumber, setSelectedNumber] = useState<RecommendedNumber | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredNumbers = recommendedNumbers.filter(number =>
    number.geo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    number.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleViewMore = (number: RecommendedNumber) => {
    setSelectedNumber(number)
    setIsModalOpen(true)
  }

  return (
    <Box>
      <Box 
        padding="space40"
        borderBottomWidth="borderWidth10" 
        borderBottomColor="colorBorderWeaker" 
        borderBottomStyle="solid"
        backgroundColor="colorBackgroundWeak"
      >
        <Stack orientation="vertical" spacing="space30">
          <Stack orientation="horizontal" spacing="space30">
            <ProductPhoneNumbersIcon decorative color="colorTextIconBrandHighlight" size="sizeIcon30" />
            <Heading as="h3" variant="heading40">
              Recommended Numbers ({recommendedNumbers.length})
            </Heading>
          </Stack>
          
          {recommendedNumbers.length > 0 && (
            <Box maxWidth="300px">
              <Label htmlFor="numberSearch">Search Numbers</Label>
              <Box position="relative">
                <Input
                  id="numberSearch"
                  type="text"
                  placeholder="Search by country or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Box
                  position="absolute"
                  right="space30"
                  top="50%"
                  style={{ transform: "translateY(-50%)" }}
                  pointerEvents="none"
                >
                  <SearchIcon decorative size="sizeIcon20" color="colorTextWeak" />
                </Box>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>

      <Box 
        height={compact ? "calc(100vh - 200px)" : "60vh"} 
        overflow="auto"
        display={["block", "block", "block"]}
      >
        {recommendedNumbers.length === 0 ? (
          <Box paddingY="space50" textAlign="center">
            <Text as="span" color="colorTextWeak" fontSize="fontSize20">
              Ask a question to get number recommendations
            </Text>
          </Box>
        ) : compact ? (
          // Mobile-first compact card layout
          <Box padding={["space30", "space40", "space40"]}>
            <Stack orientation="vertical" spacing="space50">
              {filteredNumbers.slice(0, 6).map((number, index) => (
                <Box
                  key={index}
                  padding={["space40", "space50", "space50"]}
                  borderRadius="borderRadius30"
                  backgroundColor="colorBackgroundBody"
                  borderWidth="borderWidth10"
                  borderColor="colorBorderWeak"
                  borderStyle="solid"
                  boxShadow="shadowBorder"
                >
                  <Stack orientation="vertical" spacing="space40">
                    <Text 
                      as="span" 
                      fontSize={["fontSize30", "fontSize40", "fontSize40"]} 
                      fontWeight="fontWeightSemibold" 
                      lineHeight="lineHeight30"
                    >
                      {number.geo} {number.type}
                    </Text>
                    
                    <Stack 
                      orientation={["vertical", "horizontal", "horizontal"]} 
                      spacing="space30"
                    >
                      {number.status && (
                        <Badge 
                          variant={number.status.toLowerCase() === 'available' ? 'success' : 'warning'} 
                          as="span" 
                          size="default"
                        >
                          {number.status}
                        </Badge>
                      )}
                      {number.smsEnabled && (
                        <Badge variant="info" as="span" size="default">
                          SMS
                        </Badge>
                      )}
                      {number.voiceEnabled && (
                        <Badge variant="info" as="span" size="default">
                          Voice
                        </Badge>
                      )}
                    </Stack>
                    
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleViewMore(number)}
                      width={["100%", "auto", "auto"]}
                    >
                      View Details
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>
        ) : (
          // Full table view with responsive design
          <Box padding={["space30", "space40", "space40"]}>
            <Box 
              overflowX="auto"
              display={["block", "block", "block"]}
            >
              <Table variant="borderless">
                <THead>
                  <Tr>
                    <Th>Location</Th>
                    <Th display={["none", "table-cell", "table-cell"]}>Type</Th>
                    <Th>Status</Th>
                    <Th display={["none", "table-cell", "table-cell"]}>Features</Th>
                    <Th>Actions</Th>
                  </Tr>
                </THead>
                <TBody>
                  {filteredNumbers.map((number, index) => (
                    <Tr key={index}>
                      <Td>
                        <Stack orientation="vertical" spacing="space20">
                          <Text as="span" fontWeight="fontWeightSemibold">
                            {number.geo}
                          </Text>
                          <Text 
                            as="span" 
                            fontSize="fontSize20" 
                            color="colorTextWeak"
                            display={["block", "none", "none"]}
                          >
                            {number.type}
                          </Text>
                        </Stack>
                      </Td>
                      <Td display={["none", "table-cell", "table-cell"]}>
                        {number.type}
                      </Td>
                      <Td>
                        {number.status && (
                          <Badge 
                            variant={number.status.toLowerCase() === 'available' ? 'success' : 'warning'} 
                            as="span"
                          >
                            {number.status}
                          </Badge>
                        )}
                      </Td>
                      <Td display={["none", "table-cell", "table-cell"]}>
                        <Stack orientation="horizontal" spacing="space20">
                          {number.smsEnabled && (
                            <Badge variant="info" as="span" size="small">
                              SMS
                            </Badge>
                          )}
                          {number.voiceEnabled && (
                            <Badge variant="info" as="span" size="small">
                              Voice
                            </Badge>
                          )}
                        </Stack>
                      </Td>
                      <Td>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleViewMore(number)}
                        >
                          Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>

      {/* Mobile-friendly Modal */}
      <Modal 
        ariaLabelledby="number-details-heading" 
        isOpen={isModalOpen} 
        onDismiss={() => setIsModalOpen(false)}
        size={["default", "default", "wide"]}
      >
        <ModalHeader>
          <ModalHeading as="h3" id="number-details-heading">
            {selectedNumber?.geo} {selectedNumber?.type} Details
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          {selectedNumber && (
            <Stack orientation="vertical" spacing="space50">
              <Box>
                <Stack orientation={["vertical", "horizontal", "horizontal"]} spacing="space30">
                  {selectedNumber.status && (
                    <Badge 
                      variant={selectedNumber.status.toLowerCase() === 'available' ? 'success' : 'warning'} 
                      as="span"
                    >
                      {selectedNumber.status}
                    </Badge>
                  )}
                  {selectedNumber.smsEnabled && (
                    <Badge variant="info" as="span">
                      SMS Enabled
                    </Badge>
                  )}
                  {selectedNumber.voiceEnabled && (
                    <Badge variant="info" as="span">
                      Voice Enabled
                    </Badge>
                  )}
                </Stack>
              </Box>
              
              <Box>
                <Heading as="h4" variant="heading50" marginBottom="space30">
                  Considerations
                </Heading>
                <Text as="p" fontSize={["fontSize20", "fontSize30", "fontSize30"]}>
                  {selectedNumber.considerations}
                </Text>
              </Box>
              
              {selectedNumber.restrictions && (
                <Box>
                  <Heading as="h4" variant="heading50" marginBottom="space30">
                    Restrictions
                  </Heading>
                  <Text as="p" fontSize={["fontSize20", "fontSize30", "fontSize30"]}>
                    {selectedNumber.restrictions}
                  </Text>
                </Box>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </Box>
  )
}
