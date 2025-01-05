import React from 'react';
import { Tabs, Container, Text, Title, Image, Flex, Paper, Divider } from '@mantine/core';
import Comparison from './Comparison'; // Assuming Comparison is the UploadComponent
import HeaderImage from '../assets/header.jpg';
import Recommendation from './Recommendation';

export const Dashboard = () => {
  return (
    <Container fluid px="lg">
      <Paper shadow="lg" p="xl" radius="lg" style={{ backgroundColor: '#f8f9fa' }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="space-between"
          gap="md"
        >
          <Flex direction="column" align="start" gap="sm">
            <Title order={1} size={36} align={{ base: 'center', md: 'left' }}>
              Empower Your Farming Decisions
            </Title>
            <Text size="lg" c="dimmed" align={{ base: 'center', md: 'left' }}>
              Upload your soil data to find the best crop recommendations tailored to your needs.
            </Text>
          </Flex>

          <Image
            src={HeaderImage}
            alt="Farming header"
            radius="lg"
            style={{ maxWidth: '400px', width: '100%' }}
          />
        </Flex>
      </Paper>

      <Divider my="lg" color="gray" />

      <Tabs defaultValue="comparison" color="green" keepMounted>
        <Tabs.List grow>
          <Tabs.Tab value="comparison" style={{ fontWeight: 600 }}>Comparison</Tabs.Tab>
          <Tabs.Tab value="recommendation" style={{ fontWeight: 600 }}>Recommendation</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="comparison" pt="lg">
          <Paper shadow="md" p="lg" radius="md" withBorder>
            <Comparison />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="recommendation" pt="lg">
        
          <Paper shadow="md" p="lg" radius="md" withBorder>
              <Recommendation />
          </Paper>
          
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
};
