import { Button } from '@/components/button';
import Page from '@/components/Page';
import { Box, Card, Carousel, Heading, IconButton } from '@chakra-ui/react';
import { useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

const items = Array.from({ length: 5 });

const HomePage = () => {
  const [page, setPage] = useState(0);

  return (
    <Page>
      <Box display="flex" flexDirection="column" gap="6" alignItems="center" mt="8">
        <Heading size="2xl">Cicatanya</Heading>
        <Card.Root maxW="50rem">
          <Card.Body>
            Üdvözlünk macskahotelünkben, ahol a doromboló vendégek kényelme és biztonsága az első! Szolgáltatásunk
            célja, hogy a macskák számára otthonos, játékos és teljesen biztonságos környezetet biztosítsunk, amíg
            gazdáik távol vannak. Nálunk minden cicát szeretettel, türelemmel és odafigyeléssel vár egy nyugodt,
            élménydús pihenés.
          </Card.Body>
        </Card.Root>

        <Carousel.Root slideCount={items.length} maxW="md" mx="auto" onPageChange={(e) => setPage(e.page)} page={page}>
          <Carousel.ItemGroup>
            {items.map((_, index) => (
              <Carousel.Item bgColor="yellow.300" key={index} index={index} width="200rem">
                <Box w="100%" h="300px" rounded="lg" fontSize="2.5rem">
                  {index + 1}
                </Box>
              </Carousel.Item>
            ))}
          </Carousel.ItemGroup>

          <Carousel.Control justifyContent="center" gap="4">
            <Carousel.PrevTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <LuChevronLeft />
              </IconButton>
            </Carousel.PrevTrigger>

            <Carousel.Indicators />

            <Carousel.NextTrigger asChild>
              <IconButton size="xs" variant="ghost">
                <LuChevronRight />
              </IconButton>
            </Carousel.NextTrigger>
          </Carousel.Control>
        </Carousel.Root>

        <Button asChild colorPalette="orange" size="xl">
          <a href="/bookings">Időpontot foglalok</a>
        </Button>
      </Box>
    </Page>
  );
};

export default HomePage;
