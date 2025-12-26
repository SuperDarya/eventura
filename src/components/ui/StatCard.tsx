import React from 'react'
import { Stat, StatLabel, StatNumber, StatHelpText, Box } from '@chakra-ui/react'

interface StatCardProps {
  number: string
  label: string
  helpText?: string
  color?: string
}

export const StatCard = ({ number, label, helpText, color = 'brand.400' }: StatCardProps) => {
  return (
    <Stat textAlign="center" p={4} borderRadius="lg" bg="white" boxShadow="sm">
      <StatNumber fontSize="4xl" color={color}>
        {number}
      </StatNumber>
      <StatLabel fontSize="lg" mt={2}>
        {label}
      </StatLabel>
      {helpText && <StatHelpText>{helpText}</StatHelpText>}
    </Stat>
  )
}

