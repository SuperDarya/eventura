import React, { useEffect, useMemo, useState } from 'react'
import { Box, Container, Heading, SimpleGrid, Stat, StatHelpText, StatLabel, StatNumber, Alert, AlertIcon } from '@chakra-ui/react'
import axios from 'axios'
import { AnalyticsData } from '../service/analytics/types'
import { analyticsService } from '../service/analytics'
import Loader from '../components/loader'
import { useGetAnalyticsQuery } from '../__data__/api'

const AnalyticsPage = () => {
  const {
    error, data, isLoading
  } = useGetAnalyticsQuery(undefined, {})
  
  if (isLoading) {
    return <Loader/>
  }

  if (error) {
    return <Alert status='error'>
    <AlertIcon />
    There was an error processing your request
  </Alert>
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading size="lg" mb={6}>Аналитика</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {data.map((k, i) => (
          <Box key={i} borderWidth="1px" borderRadius="md" p={4}>
            <Stat>
              <StatLabel>{k.label}</StatLabel>
              <StatNumber>{k.value}</StatNumber>
              <StatHelpText>{k.help}</StatHelpText>
            </Stat>
          </Box>
        ))}
      </SimpleGrid>
      <Box mt={6} borderWidth="1px" borderRadius="md" p={4} h="320px">Графики (заглушка)</Box>
    </Container>
  )
}

export default AnalyticsPage


