import React from 'react'
import { Stat, StatLabel, StatNumber, StatHelpText, Box, useColorModeValue } from '@chakra-ui/react'

interface StatCardProps {
  number: string
  label: string
  helpText?: string
  color?: string
}

export const StatCard = ({ number, label, helpText, color = 'brand.400' }: StatCardProps) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const helpTextColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Stat textAlign="center" p={4} borderRadius="lg" bg={bgColor} boxShadow="sm">
      <StatNumber fontSize="4xl" color={color}>
        {number}
      </StatNumber>
      <StatLabel fontSize="lg" mt={2} color={labelColor}>
        {label}
      </StatLabel>
      {helpText && <StatHelpText color={helpTextColor}>{helpText}</StatHelpText>}
    </Stat>
  )
}

