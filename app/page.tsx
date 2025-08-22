"use client"

import type React from "react"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { Box } from "@twilio-paste/core/box"
import { Button } from "@twilio-paste/core/button"
import { Card } from "@twilio-paste/core/card"
import { Heading } from "@twilio-paste/core/heading"
import { Text } from "@twilio-paste/core/text"
import { Badge } from "@twilio-paste/core/badge"
import { Form, FormControl } from "@twilio-paste/form"
import { Label } from "@twilio-paste/core/label"
import { HelpText } from "@twilio-paste/core/help-text"
import { Select, Option } from "@twilio-paste/core/select"
import { Checkbox } from "@twilio-paste/core/checkbox"
import { Input } from "@twilio-paste/core/input"
import { Stack } from "@twilio-paste/core/stack"
import { SendIcon } from "@twilio-paste/icons/esm/SendIcon"
import { ChatIcon } from "@twilio-paste/icons/esm/ChatIcon"
import { LoadingIcon } from "@twilio-paste/icons/esm/LoadingIcon"
import { FilterIcon } from "@twilio-paste/icons/esm/FilterIcon"
import { LogoTwilioIcon } from "@twilio-paste/icons/esm/LogoTwilioIcon"
import { 
  AIChatLog, 
  AIChatMessage, 
  AIChatMessageBody, 
  AIChatMessageAuthor 
} from "@twilio-paste/ai-chat-log"
import { PhoneNumbersTable } from "@/components/phone-numbers-table"
import { useTheme, ThemeToggle } from "./themed-app"
import countries from "world-countries"

interface RecommendedNumber {
  geo: string
  type: string
  status?: string
  smsEnabled: boolean
  voiceEnabled: boolean
  considerations: string
  restrictions: string
}

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

export default function TwilioChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm here to help you find the perfect Twilio phone number for your needs.\n\nPlease describe your phone number requirements including:\n• SMS needs (1-way or 2-way)\n• Your use case\n• Business presence in destination country\n• Preferred timeline\n• Expected message volume\n• Voice call requirements\n\nFeel free to provide as much detail as possible!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [smsType, setSmsType] = useState<string>("")
  const [useCase, setUseCase] = useState<string>("")
  const [businessPresence, setBusinessPresence] = useState<string>("")
  const [timeline, setTimeline] = useState<string>("")
  const [volume, setVolume] = useState<string>("")
  const [voiceRequired, setVoiceRequired] = useState<string>("")
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [countrySearchTerm, setCountrySearchTerm] = useState<string>("")
  const [lastAnswer, setLastAnswer] = useState<string>("")
  const [recommendedNumbers, setRecommendedNumbers] = useState<RecommendedNumber[]>([])
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [typingStep, setTypingStep] = useState(0)
  const [showFilters, setShowFilters] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!isLoading) return
    const id = setInterval(() => {
      setTypingStep((s) => (s + 1) % 3)
    }, 400)
    return () => clearInterval(id)
  }, [isLoading])

  const addMessage = (content: string, type: "user" | "bot") => {
    const uniqueId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as Crypto).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

    const newMessage: Message = {
      id: uniqueId,
      type,
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = inputRef.current?.value || ""
    if (!question.trim()) return

    addMessage(question, "user")
    if (inputRef.current) inputRef.current.value = ""
    setIsComplete(false)

    // Require at least one country to be selected
    if (selectedCountries.length === 0) {
      setValidationError("Please select at least one country to get accurate recommendations")
      return
    }

    // Clear any previous validation errors
    setValidationError(null)

    try {
      setIsLoading(true)
      const res = await fetch("/api/qa/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          details: {
            smsType,
            useCase,
            businessPresence,
            timeline,
            volume,
            voiceRequired,
            selectedCountries,
          },
          history: messages.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      })

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as {
          error?: string
          status?: number
          body?: unknown
        }
        addMessage(
          `Error fetching recommendation (status ${errorData.status ?? res.status}).\nDetails: ${
            typeof errorData.body === "string" ? errorData.body : JSON.stringify(errorData.body)
          }`,
          "bot"
        )
        return;
      }
      const data = (await res.json()) as { 
        answer?: string
        recommendedNumbers?: RecommendedNumber[]
      }

      console.log("=== CLIENT RECEIVED ===")
      console.log("Answer length:", data.answer?.length || "no answer")
      console.log("Answer content:", data.answer)
      console.log("RecommendedNumbers:", data.recommendedNumbers?.length || "no numbers")
      console.log("RecommendedNumbers JSON:", JSON.stringify(data.recommendedNumbers, null, 2))
      console.log("=====================")

      addMessage(data.answer ?? "", "bot")
      setLastAnswer(data.answer ?? "")

      // Update recommended numbers if provided
      if (data.recommendedNumbers && Array.isArray(data.recommendedNumbers)) {
        setRecommendedNumbers(data.recommendedNumbers)
      }
    } catch (_err) {
      addMessage(
        "Sorry, there was an error fetching the recommendation. Please try again.",
        "bot"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const { isDark } = useTheme()

  // Memoize country list computation to prevent recalculation on every render
  const filteredCountries = useMemo(() => {
    // Priority countries that should appear first
    const priorityCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE', 'NO', 'DK', 'FI', 'IE', 'BE', 'CH', 'AT', 'PT', 'BR', 'MX', 'AR', 'CL', 'IN', 'SG', 'JP', 'KR', 'HK', 'TW', 'TH', 'MY', 'PH', 'ID', 'VN']

    const priorityCountryObjects = priorityCountries
      .map(code => countries.find(c => c.cca2 === code))
      .filter((country): country is typeof countries[0] => Boolean(country))

    const otherCountries = countries
      .filter(c => !priorityCountries.includes(c.cca2))
      .sort((a, b) => a.name.common.localeCompare(b.name.common))

    const allCountries = [...priorityCountryObjects, ...otherCountries]

    // Filter countries based on search term
    return countrySearchTerm
      ? allCountries.filter(country => 
          country?.name?.common?.toLowerCase().includes(countrySearchTerm.toLowerCase())
        )
      : allCountries
  }, [countrySearchTerm])

  return (
    <Box 
      minHeight="100vh" 
      width="100vw" 
      backgroundColor="colorBackgroundBody" 
      margin="space0" 
      padding="space0"
    >
      {/* Header */}
      <Box 
        backgroundColor="colorBackgroundBrand"
        paddingY={["space30", "space40", "space40"]} 
        paddingX={["space20", "space30", "space40"]}
        borderBottomWidth="borderWidth20"
        borderBottomColor="colorBorderWeaker"
        borderBottomStyle="solid"
        boxShadow="shadowBorder"
        minHeight={["60px", "70px", "80px"]}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        style={{
          background: "linear-gradient(135deg, #F22F46 0%, #E02040 100%)"
        }}
      >
        {/* Left: Filters Button */}
        <Box flex="0 0 auto">
          <Box
            backgroundColor="colorBackgroundPrimary"
            borderRadius="borderRadius30"
            padding="space30"
            boxShadow="shadowHigh"
            borderWidth="borderWidth10"
            borderColor="colorBorderPrimary"
            borderStyle="solid"
            style={{
              backgroundColor: "#0066CC",
              borderColor: "#0066CC",
              transform: "scale(0.9)"
            }}
          >
            <Button 
              variant="primary"
              onClick={() => setShowFilters(!showFilters)}
              size={["small", "default", "default"]}
              style={{
                backgroundColor: showFilters ? "#0066CC" : "#4A90E2",
                borderColor: showFilters ? "#0066CC" : "#4A90E2",
                borderRadius: "8px",
                padding: "16px 28px",
                boxShadow: "0 2px 8px rgba(74, 144, 226, 0.25)",
                transition: "all 0.2s ease-in-out",
                fontWeight: "700",
                color: "white",
                minHeight: "48px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#0052A3"
                e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(74, 144, 226, 0.35)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = showFilters ? "#0066CC" : "#4A90E2"
                e.currentTarget.style.transform = "translateY(0px) scale(1)"
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(74, 144, 226, 0.25)"
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "translateY(0px) scale(0.98)"
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "translateY(-1px) scale(1.02)"
              }}
            >
              <Stack orientation="horizontal" spacing="space30">
                <FilterIcon decorative size="sizeIcon30" />
                <Text 
                  as="span" 
                  fontWeight="fontWeightSemibold"
                  display={["none", "block", "block"]}
                  color="colorTextInverse"
                  fontSize="16px"
                >
                  Filters
                </Text>
              </Stack>
            </Button>
          </Box>
        </Box>

        {/* Center: Title */}
        <Box 
          flex="1"
          textAlign="center"
          marginX="space40"
        >
          <Stack orientation="vertical" spacing="space10">
            <Heading 
              as="h1" 
              variant={["heading30", "heading40", "heading40"]}
              style={{ color: "white" }}
            >
              Twilio Phone Number Assistant
            </Heading>
            <Text 
              as="p"
              fontSize={["fontSize10", "fontSize20", "fontSize20"]}
              display={["none", "block", "block"]}
              style={{ color: "white" }}
            >
              Find the perfect number for your use case
            </Text>
          </Stack>
        </Box>

        {/* Right: Theme Toggle */}
        <Box flex="0 0 auto">
          <ThemeToggle />
        </Box>
      </Box>

      {/* Fixed Twilio Logo at Bottom Right - Hidden on mobile */}
      <Box
        position="fixed"
        bottom="space60"
        right="space60"
        zIndex="zIndex90"
        display={["none", "none", "block"]}
      >
        <Stack orientation="horizontal" spacing="space20">
          <LogoTwilioIcon decorative size="sizeIcon50" color="colorTextIconBrandHighlight" />
          <Text as="span" fontSize="fontSize30" fontWeight="fontWeightSemibold" color="colorText">
            Twilio
          </Text>
        </Stack>
      </Box>

      {/* Main Layout - Responsive three columns */}
      <Box 
        display="flex" 
        flexDirection={["column", "column", "row"]}
        minHeight="calc(100vh - 80px)"
        position="relative"
      >
        {/* Left Sidebar for Filters */}
        {showFilters && (
          <Box
            width={["100%", "100%", "300px"]}
            backgroundColor="colorBackgroundBody"
            borderRightWidth={["borderWidth0", "borderWidth0", "borderWidth10"]}
            borderBottomWidth={["borderWidth10", "borderWidth10", "borderWidth0"]}
            borderRightColor="colorBorderWeaker"
            borderBottomColor="colorBorderWeaker"
            borderRightStyle="solid"
            borderBottomStyle="solid"
            boxShadow="shadow"
            flexShrink={0}
            paddingTop="space20"
            maxHeight={["none", "none", "none"]}
            overflow={["visible", "visible", "visible"]}
          >
            <Box 
              padding="space40"
              borderBottomWidth="borderWidth10" 
              borderBottomColor="colorBorderWeaker" 
              borderBottomStyle="solid"
              backgroundColor="colorBackgroundWeak"
            >
              <Heading as="h3" variant="heading40">
                Filter Options
              </Heading>
            </Box>

            <Box paddingX="space40" paddingY="space40">
              <Stack orientation="vertical" spacing="space30">
                <FormControl>
                  <Label htmlFor="smsType">SMS Type</Label>
                  <Select
                    id="smsType"
                    value={smsType}
                    onChange={(e) => setSmsType(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="1-way">1-way SMS</Option>
                    <Option value="2-way">2-way SMS</Option>
                  </Select>
                  <HelpText>Choose your SMS communication needs</HelpText>
                </FormControl>

                <FormControl>
                  <Label htmlFor="useCase">Use Case</Label>
                  <Select
                    id="useCase"
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="marketing">Marketing</Option>
                    <Option value="support">Support</Option>
                    <Option value="authentication">Authentication</Option>
                    <Option value="notifications">Notifications</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <Label htmlFor="businessPresence">Business Presence</Label>
                  <Select
                    id="businessPresence"
                    value={businessPresence}
                    onChange={(e) => setBusinessPresence(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="yes-local">Yes - Local presence</Option>
                    <Option value="no-local">No local presence</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <Label htmlFor="timeline">Timeline</Label>
                  <Select
                    id="timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="asap">ASAP</Option>
                    <Option value="1-2 days">1-2 days</Option>
                    <Option value="1-3 weeks">1-3 weeks</Option>
                    <Option value="6-12 weeks">6-12 weeks</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <Label htmlFor="volume">Expected Volume</Label>
                  <Select
                    id="volume"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="<1k/day">Low (&lt;1k/day)</Option>
                    <Option value="1k-10k/day">Medium (1k-10k/day)</Option>
                    <Option value="10k-100k/day">High (10k-100k/day)</Option>
                    <Option value=">100k/day">Very High (&gt;100k/day)</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <Label htmlFor="voiceRequired">Voice Calls</Label>
                  <Select
                    id="voiceRequired"
                    value={voiceRequired}
                    onChange={(e) => setVoiceRequired(e.target.value)}
                    disabled={isLoading}
                  >
                    <Option value="">Any</Option>
                    <Option value="yes">Required</Option>
                    <Option value="no">Not required</Option>
                  </Select>
                </FormControl>

                <FormControl>
                  <Label htmlFor="countries">
                    <Stack orientation="horizontal" spacing="space20">
                      <Text as="span">Countries</Text>
                      <Text as="span" color="colorTextError" fontWeight="fontWeightSemibold">*</Text>
                      <Text as="span" color="colorTextError" fontSize="fontSize20">(Required)</Text>
                    </Stack>
                  </Label>
                  <Box
                    borderRadius="borderRadius20"
                    borderWidth="borderWidth10"
                    borderColor={selectedCountries.length === 0 ? "colorBorderError" : "colorBorderWeaker"}
                    borderStyle="solid"
                    padding="space30"
                    maxHeight={["200px", "200px", "200px"]}
                    overflow={["auto", "auto", "auto"]}
                    backgroundColor="colorBackgroundBody"
                    style={{
                      borderBottomWidth: selectedCountries.length === 0 ? "3px" : "1px",
                      borderBottomColor: selectedCountries.length === 0 ? "#E02040" : undefined
                    }}
                  >
                    <Stack orientation="vertical" spacing="space20">
                      <Input
                        type="text"
                        placeholder="Search countries..."
                        id="countrySearch"
                        value={countrySearchTerm}
                        onChange={(e) => setCountrySearchTerm(e.target.value)}
                      />
                      {filteredCountries.map((country) => (
                          <Box key={country.cca2}>
                            <Checkbox
                              id={`country-${country.cca2}`}
                              checked={selectedCountries.includes(country.cca2)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCountries(prev => [...prev, country.cca2])
                                } else {
                                  setSelectedCountries(prev => prev.filter(c => c !== country.cca2))
                                }
                                // Clear validation error when user selects/deselects countries
                                if (validationError) {
                                  setValidationError(null)
                                }
                              }}
                            >
                              <Text as="span" fontSize="fontSize20">
                                {country.flag} {country.name.common}
                              </Text>
                            </Checkbox>
                          </Box>
                        ))}
                    </Stack>
                  </Box>
                  <HelpText>
                    {selectedCountries.length === 0 ? (
                      <Text as="span" color="colorTextError">
                        Please select at least one country to get accurate recommendations
                      </Text>
                    ) : (
                      `Select countries where you need phone numbers (${selectedCountries.length} selected, ${countries.length} available)`
                    )}
                  </HelpText>
                </FormControl>
              </Stack>
            </Box>
          </Box>
        )}

        {/* Chat Interface Section */}
        <Box 
          flex={["1", "1", "2"]}
          paddingX={["space20", "space30", "space40"]}
          paddingY="space0"
          paddingTop="space20"
          display="flex"
          flexDirection="column"
          minHeight={["auto", "auto", "calc(100vh - 100px)"]}
        >
            {/* Chat Interface */}
            <Card padding="space0" display="flex" flexDirection="column" overflow="visible">
              <Box 
                padding="space40" 
                borderBottomWidth="borderWidth10" 
                borderBottomColor="colorBorderWeaker"
                borderBottomStyle="solid"
                backgroundColor="colorBackgroundWeak"
                flexShrink={0}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack orientation="horizontal" spacing="space30">
                  <ChatIcon decorative color="colorTextIconBrandHighlight" size="sizeIcon30" />
                  <Heading as="h2" variant="heading40">Chat Assistant</Heading>
                </Stack>
                <Badge variant={isLoading ? "info" : "success"} as="span">
                  {isLoading ? (
                    <Stack orientation="horizontal" spacing="space20">
                      <LoadingIcon decorative size="sizeIcon10" />
                      <Text as="span">Thinking...</Text>
                    </Stack>
                  ) : (
                    "Ready"
                  )}
                </Badge>
              </Box>

              <Box 
                padding={["space20", "space30", "space40"]}
                backgroundColor="colorBackgroundBody"
                maxHeight={["none", "none", "500px"]}
                overflow={["visible", "visible", "auto"]}
              >
                <AIChatLog>
                  {messages.map((message) => (
                    <AIChatMessage key={message.id} variant={message.type === "user" ? "user" : "bot"}>
                      {message.type === "bot" && (
                        <AIChatMessageAuthor aria-label="Assistant">
                          Twilio Assistant
                        </AIChatMessageAuthor>
                      )}
                      <AIChatMessageBody>
                        <Text 
                          as="span" 
                          fontSize={["fontSize20", "fontSize30", "fontSize30"]}
                          lineHeight={["lineHeight20", "lineHeight30", "lineHeight30"]}
                        >
                          {message.content}
                        </Text>
                      </AIChatMessageBody>
                    </AIChatMessage>
                  ))}
                  {isLoading && (
                    <AIChatMessage variant="bot">
                      <AIChatMessageAuthor aria-label="Assistant">
                        Twilio Assistant
                      </AIChatMessageAuthor>
                      <AIChatMessageBody>
                        <Stack orientation="horizontal" spacing="space20">
                          <Box className="loading-spin">
                            <LoadingIcon decorative size="sizeIcon20" />
                          </Box>
                          <Text as="span">Analyzing your requirements...</Text>
                        </Stack>
                      </AIChatMessageBody>
                    </AIChatMessage>
                  )}
                  <div ref={messagesEndRef} />
                </AIChatLog>
              </Box>

              <Box 
                padding={["space20", "space30", "space40"]} 
                borderTopWidth="borderWidth10" 
                borderTopColor="colorBorderWeaker"
                borderTopStyle="solid"
                backgroundColor="colorBackgroundWeak"
                flexShrink={0}
              >
                <Form onSubmit={handleSubmit}>
                  <FormControl>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Box position="relative">
                      <textarea
                        id="requirements"
                        ref={inputRef}
                        placeholder="Describe your specific phone number requirements..."
                        rows={3}
                        disabled={isLoading}
                        style={{
                          paddingRight: "60px",
                          width: "100%",
                          padding: "12px",
                          border: "1px solid #d2d6dc",
                          borderRadius: "4px",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          resize: "vertical",
                          outline: "none",
                          minHeight: "80px"
                        }}
                      />
                      <Box
                        position="absolute"
                        right={["space30", "space40", "space50"]}
                        top="50%"
                        zIndex="zIndex10"
                        style={{ transform: "translateY(-50%)" }}
                      >
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={isLoading}
                          loading={isLoading}
                          size="default"
                          style={{
                            backgroundColor: "#F22F46",
                            borderColor: "#F22F46",
                            borderRadius: "8px",
                            padding: "12px 16px",
                            boxShadow: "0 2px 8px rgba(242, 47, 70, 0.25)",
                            transition: "all 0.2s ease-in-out",
                            fontWeight: "600",
                            color: "white"
                          }}
                          onMouseEnter={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.backgroundColor = "#E02040"
                              e.currentTarget.style.transform = "translateY(-1px)"
                              e.currentTarget.style.boxShadow = "0 4px 12px rgba(242, 47, 70, 0.35)"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.backgroundColor = "#F22F46"
                              e.currentTarget.style.transform = "translateY(0px)"
                              e.currentTarget.style.boxShadow = "0 2px 8px rgba(242, 47, 70, 0.25)"
                            }
                          }}
                          onMouseDown={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.transform = "translateY(0px) scale(0.98)"
                            }
                          }}
                          onMouseUp={(e) => {
                            if (!isLoading) {
                              e.currentTarget.style.transform = "translateY(-1px) scale(1)"
                            }
                          }}
                        >
                          <Stack orientation="horizontal" spacing="space20">
                            <SendIcon decorative size="sizeIcon20" />
                            <Text 
                              as="span" 
                              fontWeight="fontWeightSemibold"
                              display={["none", "block", "block"]}
                              color="colorTextInverse"
                            >
                              Send
                            </Text>
                          </Stack>
                        </Button>
                      </Box>
                    </Box>
                    {validationError && (
                      <HelpText variant="error">{validationError}</HelpText>
                    )}
                    <HelpText>Provide as much detail as possible about your phone number needs</HelpText>
                  </FormControl>
                </Form>
              </Box>
            </Card>
        </Box>

        {/* Phone Numbers Section */}
        <Box 
          flex={["1", "1", "1"]}
          paddingX={["space20", "space30", "space40"]}
          paddingY="space0"
          paddingTop="space20"
          display={["block", "block", "block"]}
          minHeight={["auto", "auto", "auto"]}
        >
          <Box 
            backgroundColor="colorBackgroundWeak"
            borderRadius="borderRadius30"
            borderWidth="borderWidth10"
            borderColor="colorBorderWeaker"
            borderStyle="solid"
            height={["auto", "auto", "auto"]}
          >
              <PhoneNumbersTable 
                requirements={{
                  smsType,
                  useCase,
                  businessPresence,
                  voiceRequired,
                }}
                recommendedNumbers={recommendedNumbers}
                compact={true}
              />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}