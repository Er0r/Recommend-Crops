import React from 'react';
import { Container, Group, Paper, Text, Image } from '@mantine/core';
import WheatIcon from '../assets/wheat.png';

const Topbar = () => {
  return (
    <Paper shadow="md" p="xs" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#f8f9fa' }}>
      <Container fluid>
        <Group position="apart" align="center">
          <Group align="center">
            <Image src={WheatIcon} alt="Wheat Icon" width={32} height={32} />
            <Text size="xl" weight={700}>Intelligent Crop Recommendation</Text>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
};

export default Topbar;
